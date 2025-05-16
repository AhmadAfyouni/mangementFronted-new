import { FileObject } from "@/components/common/atoms/departments/DeptAdditionalSection";
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
      // Return the file URLs without prepending the base URL again
      // The API response already includes the complete URL paths
      return response.data.files.map((selFile) => selFile.publicUrl);
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

      // Return the full URL without prepending the base URL again
      // The API response already includes the complete URL path
      return response.data.file.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

export default FileUploadService;
