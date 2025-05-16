import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteResponse } from "@/types/FileManager.type";
import FileManagerService from "@/services/fileManager.service";

interface FileDeleteParams {
  fileId: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Hook for deleting files
 * @returns Mutation functions and states for file deletion
 */
export const useFileDelete = () => {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation<
    DeleteResponse, 
    Error, 
    FileDeleteParams, 
    unknown
  >({
    mutationFn: async ({ fileId }) => {
      return await FileManagerService.deleteFile(fileId);
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh file lists
      if (variables.entityType && variables.entityId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files', variables.entityType, variables.entityId] 
        });
      }
      
      // Always invalidate the specific file's versions
      queryClient.invalidateQueries({ 
        queryKey: ['fileVersions', variables.fileId] 
      });
    },
  });
  
  return {
    deleteFile: deleteMutation.mutate,
    deleteFileAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    deleteResult: deleteMutation.data,
    deleteReset: deleteMutation.reset,
  };
};

interface VersionDeleteParams {
  versionId: string;
  fileId: string;
}

/**
 * Hook for deleting specific file versions
 * @returns Mutation functions and states for version deletion
 */
export const useVersionDelete = () => {
  const queryClient = useQueryClient();
  
  const deleteVersionMutation = useMutation<
    DeleteResponse, 
    Error, 
    VersionDeleteParams, 
    unknown
  >({
    mutationFn: async ({ versionId }) => {
      return await FileManagerService.deleteVersion(versionId);
    },
    onSuccess: (data, variables) => {
      // Invalidate the file versions query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['fileVersions', variables.fileId] 
      });
    },
  });
  
  return {
    deleteVersion: deleteVersionMutation.mutate,
    deleteVersionAsync: deleteVersionMutation.mutateAsync,
    isDeletingVersion: deleteVersionMutation.isPending,
    deleteVersionError: deleteVersionMutation.error,
    deleteVersionResult: deleteVersionMutation.data,
    deleteVersionReset: deleteVersionMutation.reset,
  };
};
