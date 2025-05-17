import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileObject, FileUploadResponse } from "@/types/FileManager.type";
import FileManagerService from "@/services/fileManager.service";

/**
 * Hook for uploading files
 * @returns Mutation functions and states for file upload
 */
export const useFileUpload = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation<
    FileUploadResponse,
    Error,
    FileObject & {
      entityType: string;
      entityId: string;
      fileType: string; // Changed from optional to required
      description?: string;
    },
    unknown
  >({
    mutationFn: async (uploadData) => {
      return await FileManagerService.uploadFile(uploadData);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['files', variables.entityType, variables.entityId]
      });

      // If we have a specific file type, invalidate that query as well
      if (variables.fileType) {
        queryClient.invalidateQueries({
          queryKey: ['files', variables.entityType, variables.entityId, variables.fileType]
        });
      }
    },
  });

  return {
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    uploadResult: uploadMutation.data,
    uploadReset: uploadMutation.reset,
  };
};