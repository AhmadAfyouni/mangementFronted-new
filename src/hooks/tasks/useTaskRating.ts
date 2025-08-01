import { useMokkBar } from "@/components/Providers/Mokkbar";
import { rateTask } from "@/services/task.service";
import { TaskRatingRequest } from "@/types/Task.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useLanguage from "../useLanguage";

interface UseTaskRatingParams {
    taskId: string;
    status: "DONE" | "CLOSED" | "CANCELED";
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useTaskRating = ({
    taskId,
    status,
    onSuccess,
    onError,
}: UseTaskRatingParams) => {
    const { t } = useLanguage();
    const { setSnackbarConfig } = useMokkBar();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: TaskRatingRequest) => rateTask(taskId, status, data),
        onSuccess: () => {
            setSnackbarConfig({
                open: true,
                message: t("Task status updated successfully"),
                severity: "success",
            });

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["tasks", "get-all"] });
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            onSuccess?.();
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message || t("Failed to update task status");

            console.error("Task rating error:", error);

            setSnackbarConfig({
                open: true,
                message: errorMessage,
                severity: "error",
            });

            onError?.(error);
        },
    });

    return {
        rateTask: mutation.mutate,
        rateTaskAsync: mutation.mutateAsync,
        isRating: mutation.isPending,
        error: mutation.error,
    };
}; 