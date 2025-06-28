/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useTaskForm.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addTaskSchema } from "@/schemas/task.schema";
import { TaskFormInputs } from "@/types/Task.type";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import getErrorMessages from "@/utils/handleErrorMessages";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export const useTaskForm = () => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { setSnackbarConfig } = useMokkBar();
  const router = useRouter();
  const { t } = useTranslation();

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    setValue,
    control
  } = useForm<TaskFormInputs>({
    resolver: yupResolver(addTaskSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      priority: "",
      start_date: today,
      due_date: "",
      status: "PENDING",
      isRecurring: false,
      isRoutineTask: false,
      progressCalculationMethod: "time_based",
    },
  });

  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return {
    formMethods: {
      register,
      handleSubmit,
      errors,
      reset,
      watch,
      getValues,
      setValue,
      control
    },
    selectedEmp,
    setSelectedEmp,
    feedbackMessage,
    setFeedbackMessage,
    setSnackbarConfig,
    t,
    router,
  };
};
