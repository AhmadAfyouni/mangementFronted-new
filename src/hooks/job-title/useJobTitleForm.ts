import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { addTitleSchema } from "@/schemas/job.schema";
import { JobTitleFormInputs } from "@/types/JobTitle.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useQueryPageData from "../useQueryPageData";

export function useJobTitleForm() {
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<JobTitleFormInputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(addTitleSchema) as any,
    defaultValues: {
      title: "",
      category: "",
      description: "",
      responsibilities: [],
      permissions: [],
      department_id: "",
      is_manager: false,
      accessibleDepartments: [],
      accessibleEmps: [],
      accessibleJobTitles: [],
      routineTasks: [],
      hasRoutineTasks: false,
      autoGenerateRoutineTasks: true,
    },
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const jobTitleData = useQueryPageData<JobTitleFormInputs>(reset);

  const {
    mutate: addJobTitle,
    isPending: isPendingJobTitle,
    isError: isErrorJobTitle,
    error: errorJobTitle,
  } = useCreateMutation({
    endpoint: jobTitleData
      ? `/job-titles/update/${jobTitleData.id}`
      : `/job-titles/create`,
    onSuccessMessage: jobTitleData
      ? t("Job Title updated successfully!")
      : t("Job Title added successfully!"),
    invalidateQueryKeys: ["jobTitles"],
    onSuccessFn() {
      reset();
      setSnackbarConfig({
        open: true,
        message: jobTitleData
          ? "Job Title updated successfully!"
          : "Job Title created successfully!",
        severity: "success",
      });
      setTimeout(() => router.back(), 1000);
    },
  });

  return {
    register,
    handleSubmit,
    errors,
    reset,
    setValue,
    getValues,
    addJobTitle,
    isPendingJobTitle,
    isErrorJobTitle,
    errorJobTitle,
    jobTitleData,
  };
}
