/* eslint-disable */
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { apiClient } from "@/utils/axios/usage";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

type MutationInput = Record<string, any>;
type MutationResponse = any;

interface UseCreateMutationParams<
  TInput = MutationInput,
  TResponse = MutationResponse
> {
  endpoint: string;
  onSuccessMessage?: string;
  invalidateQueryKeys?: string[];
  onSuccessFn?: (data?: TResponse) => void;
  requestType?: "post" | "put" | "delete" | "patch" | "get";
  options?: UseMutationOptions<TResponse, unknown, TInput, unknown>;
}

export const useCreateMutation = <
  TInput = MutationInput,
  TResponse = MutationResponse
>({
  endpoint,
  onSuccessMessage,
  invalidateQueryKeys = [],
  onSuccessFn,
  requestType = "post",
  options,
}: UseCreateMutationParams<TInput, TResponse>): UseMutationResult<
  TResponse,
  unknown,
  TInput,
  unknown
> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { setSnackbarConfig } = useMokkBar();
  const mutationAddFunction = async (data: TInput) => {
    const response = await apiClient.post(endpoint, data);
    return response as TResponse;
  };
  const mutationUpdateFunction = async (data: TInput) => {
    const response = await apiClient.put(endpoint, data);
    return response as TResponse;
  };
  const mutationPatchFunction = async (data: TInput) => {
    const response = await apiClient.patch(endpoint, data);
    return response as TResponse;
  };
  const mutationDeleteFunction = async () => {
    const response = await apiClient.delete(endpoint);
    return response as TResponse;
  };
  const mutationGetFunction = async () => {
    const response = await apiClient.get(endpoint);
    return response as TResponse;
  };

  return useMutation<TResponse, unknown, TInput>({
    mutationFn:
      requestType == "post"
        ? mutationAddFunction
        : requestType == "put"
        ? mutationUpdateFunction
        : requestType == "patch"
        ? mutationPatchFunction
        : requestType == "get"
        ? mutationGetFunction
        : mutationDeleteFunction,
    onSuccess: (data: TResponse) => {
      if (onSuccessMessage) {
        console.log(onSuccessMessage, data);
      }
      setSnackbarConfig({
        open: true,
        message: onSuccessMessage || t("Successful"),
        severity: "success",
      });
      invalidateQueryKeys.forEach((key) => {
        //@ts-ignore
        queryClient.invalidateQueries(key);
      });
      onSuccessFn && onSuccessFn(data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || t("An error occurred");

      console.error("Detailed Error:", errorMessage);

      setSnackbarConfig({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    },
    ...options,
  });
};
