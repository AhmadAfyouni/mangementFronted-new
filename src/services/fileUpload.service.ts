import { FileObject } from "@/types/FileManager.type";
import { tokenService } from "@/utils/axios/tokenService";
import axios from "axios";

interface MultiFileUploadResponse {
  message: string;
  files: {
    originalname: string;
    filename: string;
    path: string;
    publicUrl: string;
    size: number;
  }[];
  userId: string;
  userEmail: string;
  customPath: string;
}

type SingleFileUploadResponse = Omit<MultiFileUploadResponse, "files"> & {
  file: {
    originalname: string;
    filename: string;
    path: string;
    publicUrl: string;
    size: number;
  };
};

class FileUploadService {
  // Using the file storage URL specifically for upload operations
  private static readonly baseUrl: string = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || "";
  // Make sure we're not adding any path segments as they should be included in the URL

  // Helper method to ensure complete URL
  private static ensureCompleteUrl(url: string): string {
    // If the URL is already complete (starts with http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Use the base URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // If it's a relative URL,     prepend the base URL
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }

    // If it doesn't start with /, add both base URL and /
    return `${baseUrl}/${url}`;
  }

  static async uploadMultipleFiles(files: FileObject[], path: string) {
    if (!files || !files.length) {
      throw new Error("No files provided for upload");
    }

    console.log(`Preparing to upload ${files.length} files`);

    const formData = new FormData();
    formData.append("path", path);
    files.forEach((fileObj) => {
      formData.append("files", fileObj.file, fileObj.name);
    });

    try {
      const response = await axios.post<MultiFileUploadResponse>(
        `${FileUploadService.baseUrl}/upload-multiple`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenService.getAccessToken()}`,
          },
        }
      );

      console.log("Files uploaded successfully:", response.data);
      // Ensur e complete URLs are returned
      return response.data.files.map((selFile) =>
        FileUploadService.ensureCompleteUrl(selFile.publicUrl)
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  static async uploadSingleFile(file: FileObject, path: string) {
    const formData = new FormData();
    formData.append("file", file.file, file.name);
    formData.append("path", path);
    try {
      const response = await axios.post<SingleFileUploadResponse>(
        `${FileUploadService.baseUrl}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenService.getAccessToken()}`,
          },
        }
      );

      console.log("Single file upload response:", response.data);
      // Ensure complete URL is returned
      const completeUrl = FileUploadService.ensureCompleteUrl(response.data.file.publicUrl);
      console.log("Complete file URL:", completeUrl);
      return completeUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

export default FileUploadService;
