import { useQuery } from "@tanstack/react-query";
import { FilesByEntityResponse } from "@/types/FileManager.type";
import FileManagerService from "@/services/fileManager.service";

/**
 * Hook for fetching files by entity
 * @param entityType Type of entity (e.g., 'department', 'employee', 'task')
 * @param entityId ID of the entity
 * @param fileType Optional file type to filter by
 * @param enabled Whether the query should be enabled
 * @returns Query result with files data
 */
export const useFilesByEntity = (
  entityType: string,
  entityId: string,
  fileType: string, // Changed from optional to required
  enabled: boolean = true
) => {
  const queryKey = fileType 
    ? ['files', entityType, entityId, fileType]
    : ['files', entityType, entityId];
    
  return useQuery<FilesByEntityResponse, Error>({
    queryKey,
    queryFn: async () => {
      return await FileManagerService.getFilesByEntity(entityType, entityId, fileType);
    },
    enabled: !!entityId && !!entityType && enabled,
    staleTime: 0, // Always consider data stale to force refresh
    refetchInterval: 2000, // Refetch every 2 seconds when the component is visible
  });
};