import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SetCurrentVersionResponse } from "@/types/FileManager.type";
import FileManagerService from "@/services/fileManager.service";

interface SetVersionParams {
  versionId: string;
  fileId: string;
}

/**
 * Hook for setting the current version of a file
 * @returns Mutation functions and states for setting current version
 */
export const useSetCurrentVersion = () => {
  const queryClient = useQueryClient();
  
  const setVersionMutation = useMutation<
    SetCurrentVersionResponse, 
    Error, 
    SetVersionParams, 
    unknown
  >({
    mutationFn: async ({ versionId }) => {
      return await FileManagerService.setCurrentVersion(versionId);
    },
    onSuccess: (data, variables) => {
      // Invalidate the file versions query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['fileVersions', variables.fileId] 
      });
      
      // Also invalidate any entity file lists that might display this file
      // We can't know exactly which ones, so we don't invalidate them here
      // The component using this hook can do more specific invalidations if needed
    },
  });
  
  return {
    setCurrentVersion: setVersionMutation.mutate,
    setCurrentVersionAsync: setVersionMutation.mutateAsync,
    isSetting: setVersionMutation.isPending,
    setVersionError: setVersionMutation.error,
    setVersionResult: setVersionMutation.data,
    setVersionReset: setVersionMutation.reset,
  };
};
