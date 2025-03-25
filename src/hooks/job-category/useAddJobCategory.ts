import { useCreateMutation } from "@/hooks/useCreateMutation";
import { JobCategoryFormInputs } from "@/types/JobCategory.type";
import { MokkBarContextType } from "@/types/MokkBar.type";
import { useRouter } from "next/navigation";
import useLanguage from "../useLanguage";

export const useAddJobCategory = ({
  jobCategoryData,
  reset,
  setSnackbarConfig,
}: {
  jobCategoryData: JobCategoryFormInputs | null;
  reset: () => void;
  setSnackbarConfig: MokkBarContextType["setSnackbarConfig"];
}) => {
  const { t } = useLanguage();
  const router = useRouter();

  const {
    mutate: addJobCategory,
    isPending: isPendingJobCategory,
    isError: isErrorJobCategory,
    error: errorJobCategory,
  } = useCreateMutation({
    endpoint: jobCategoryData
      ? `/job-categories/update-job-category/${jobCategoryData.id}`
      : `/job-categories`,
    onSuccessMessage: t("Job Category added successfully!"),
    invalidateQueryKeys: ["jobCategories"],
    onSuccessFn: () => {
      reset();
      setSnackbarConfig({
        open: true,
        message: jobCategoryData
          ? t("Job Category updated successfully!")
          : t("Job Category created successfully!"),
        severity: "success",
      });

      setTimeout(() => router.back(), 1000);
    },
  });

  return {
    addJobCategory,
    isPendingJobCategory,
    isErrorJobCategory,
    errorJobCategory,
  };
};
