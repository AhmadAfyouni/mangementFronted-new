import { useMokkBar } from "@/components/Providers/Mokkbar";
import { addDeptSchema } from "@/schemas/department.schema";
import { DepartmentFormInputs } from "@/types/DepartmentType.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export const useAddDeptForm = () => {
  const { setSnackbarConfig } = useMokkBar();
  const {
    register,
    getValues,
    control,
    formState: { errors },
    setValue,
    handleSubmit,
    reset,
  } = useForm<DepartmentFormInputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(addDeptSchema) as any,
    defaultValues: {},
  });

  const {
    fields: numericOwnersFields,
    append: appendNumericOwner,
    remove: removeNumericOwner,
  } = useFieldArray({ control, name: "numericOwners" });

  const {
    fields: requiredReportsFields,
    append: appendRequiredReport,
    remove: removeRequiredReport,
  } = useFieldArray({ control, name: "requiredReports" });

  const {
    fields: developmentProgramsFields,
    append: appendDevelopmentProgram,
    remove: removeDevelopmentProgram,
  } = useFieldArray({ control, name: "developmentPrograms" });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return {
    reset,
    register,
    getValues,
    control,
    errors,
    setValue,
    handleSubmit,
    numericOwnersFields,
    appendNumericOwner,
    removeNumericOwner,
    requiredReportsFields,
    appendRequiredReport,
    removeRequiredReport,
    developmentProgramsFields,
    appendDevelopmentProgram,
    removeDevelopmentProgram,
  };
};
