import {
  DeleteResponse,
  FilesByEntityResponse,
  FileEntity,
  FileObject,
  FileUploadInput,
  FileUploadResponse,
  FileUploadWithFile,
  FileVersionsResponse,
  SetCurrentVersionResponse
} from "@/types/FileManager.type";
import FileUploadService from "./fileUpload.service";
import { apiClient } from "@/utils/axios/usage";

class FileManagerService {
  // Use the main API URL for file management operations instead of file storage URL
  private static readonly baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "";
  private static readonly filesApiPath: string = "/files"; // The endpoint path for file management

  /**
   * Upload a file to the file storage service and register it in the file management system
   * @param uploadData File upload data including local file and metadata
   */
  static async uploadFile(uploadData: FileObject & {
    entityType: string;
    entityId: string;
    fileType?: string;
    description?: string;
  }): Promise<FileUploadResponse> {
    try {
      // First, upload the physical file to the file storage service
      const fileUrl = await FileUploadService.uploadSingleFile(
        {
          file: uploadData.file,
          name: uploadData.name
        },
        uploadData.entityType
      );

      // Then, register the file in the file management system
      const fileData: FileUploadInput = {
        fileUrl,
        originalName: uploadData.name,
        entityType: uploadData.entityType,
        entityId: uploadData.entityId,
        fileType: uploadData.fileType || 'document',
        description: uploadData.description,
      };

      const response = await apiClient.post<FileUploadResponse>(
        `${this.baseUrl}${this.filesApiPath}/upload`,
        fileData
      );

      return response;
    } catch (error) {
      console.error("Error in file upload process:", error);
      throw error;
    }
  }

  /**
   * Get all versions of a file
   * @param fileId The ID of the file
   */
  static async getFileVersions(fileId: string): Promise<FileVersionsResponse> {
    try {
      const response = await apiClient.get<FileVersionsResponse>(
        `${this.baseUrl}${this.filesApiPath}/${fileId}/versions`
      );
      return response;
    } catch (error) {
      console.error("Error getting file versions:", error);
      throw error;
    }
  }

  /**
   * Set a specific version as the current version
   * @param versionId The ID of the version to set as current
   */
  static async setCurrentVersion(versionId: string): Promise<SetCurrentVersionResponse> {
    try {
      const response = await apiClient.put<SetCurrentVersionResponse>(
        `${this.baseUrl}${this.filesApiPath}/version/${versionId}/set-current`
      );
      return response;
    } catch (error) {
      console.error("Error setting current version:", error);
      throw error;
    }
  }

  /**
   * Get files associated with a specific entity
   * @param entityType The type of entity (department, employee, task)
   * @param entityId The ID of the entity
   * @param fileType Optional file type filter
   */
  static async getFilesByEntity(
    entityType: string,
    entityId: string,
    fileType?: string
  ): Promise<FilesByEntityResponse> {
    try {
      const url = fileType
        ? `${this.baseUrl}${this.filesApiPath}/entity/${entityType}/${entityId}?fileType=${fileType}`
        : `${this.baseUrl}${this.filesApiPath}/entity/${entityType}/${entityId}`;

      const response = await apiClient.get<FilesByEntityResponse>(url);
      return response;
    } catch (error) {
      console.error("Error getting files by entity:", error);
      throw error;
    }
  }

  /**
   * Delete a file and all its versions
   * @param fileId The ID of the file to delete
   */
  static async deleteFile(fileId: string): Promise<DeleteResponse> {
    try {
      const response = await apiClient.delete<DeleteResponse>(
        `${this.baseUrl}${this.filesApiPath}/${fileId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Delete a specific version of a file
   * @param versionId The ID of the version to delete
   */
  static async deleteVersion(versionId: string): Promise<DeleteResponse> {
    try {
      const response = await apiClient.delete<DeleteResponse>(
        `${this.baseUrl}${this.filesApiPath}/version/${versionId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting version:", error);
      throw error;
    }
  }

  /**
   * Helper method to extract filename from a file URL
   * @param fileUrl The URL of the file
   */
  static getFilenameFromUrl(fileUrl: string): string {
    try {
      // Extract the filename from the URL
      const parts = fileUrl.split('/');
      let filename = parts[parts.length - 1];

      // Remove any query parameters
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }

      return decodeURIComponent(filename);
    } catch (error) {
      console.error("Error extracting filename from URL:", error);
      return fileUrl;
    }
  }

  /**
   * Format a date string for display
   * @param dateString The date string to format
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }
}

export default FileManagerService;