// hooks/useTaskSubmit.ts
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRouter } from "next/navigation";
import useLanguage from "../useLanguage";

export const useTaskSubmit = (
  selectedEmployee: string | undefined,
  selectedDepartment: string | undefined,
  isProjectDisabled: boolean,
  reset: () => void
) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { setSnackbarConfig } = useMokkBar();
  const { mutate: addTask, isPending } = useCreateMutation({
    endpoint: selectedEmployee
      ? "/tasks/create"
      : selectedDepartment && isProjectDisabled
        ? "/tasks/create-task-department"
        : "/tasks/create-task-project",
    onSuccessMessage: t("Task added successfully!"),
    invalidateQueryKeys: ["tasks", "get-all"],
    onSuccessFn() {
      setSnackbarConfig({
        open: true,
        message: t("Task created successfully!"),
        severity: "success",
      });
      reset();
      setTimeout(() => router.back(), 1000);
    },
  });

  return {
    addTask,
    isPending,
  };
};
