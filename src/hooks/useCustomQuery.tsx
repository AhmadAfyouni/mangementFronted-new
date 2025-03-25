/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { apiClient } from "@/utils/axios/usage";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

interface CustomQueryOptions<TData>
  extends Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn"> {
  queryKey: string[];
  url: string;

  nestedData?: boolean;
}

const useCustomQuery = <TData,>({
  queryKey,
  url,
  nestedData = false,
  ...options
}: CustomQueryOptions<TData>) => {
  const { setSnackbarConfig } = useMokkBar();

  return useQuery<TData>({
    queryKey,
    queryFn: async (): Promise<TData> => {
      try {
        const response = await apiClient.get<TData>(url);
        console.log("query response : ", response);

        // @ts-ignore
        return nestedData ? response.data : response;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setSnackbarConfig({
            open: true,
            message: `Error: ${
              error.response.data.message || "An error occurred"
            }`,
            severity: "error",
          });
        } else {
          setSnackbarConfig({
            open: true,
            message: "Network error. Please try again later.",
            severity: "error",
          });
        }
        throw error;
      }
    },
    retry: 1,
    ...options,
  });
};

export default useCustomQuery;
