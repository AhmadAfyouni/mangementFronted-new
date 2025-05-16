import { useQuery } from "@tanstack/react-query";
import { FileVersionsResponse } from "@/types/FileManager.type";
import FileManagerService from "@/services/fileManager.service";

/**
 * Hook for fetching all versions of a file
 * @param fileId ID of the file
 * @param enabled Whether the query should be enabled
 * @returns Query result with file versions data
 */
export const useFileVersions = (
  fileId: string,
  enabled: boolean = true
) => {
  return useQuery<FileVersionsResponse, Error>({
    queryKey: ['fileVersions', fileId],
    queryFn: async () => {
      return await FileManagerService.getFileVersions(fileId);
    },
    enabled: !!fileId && enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
