/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import { ConditionalSection } from "@/components/common/atoms/tasks/ConditionalSection";
import { FixedSection } from "@/components/common/atoms/tasks/FixedSection";
import { RecurringSection } from "@/components/common/atoms/tasks/RecurringSection";
import { getTaskTarget } from "@/hooks/tasks/getTaskTarget";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { useTaskFormState } from "@/hooks/tasks/useTaskFormState";
import { useTaskQueries } from "@/hooks/tasks/useTaskQueries";
import { useTaskSubmit } from "@/hooks/tasks/useTaskSubmit";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { TaskFormInputs } from "@/types/Task.type";
import React from "react";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import FileUploadSection from "@/components/common/atoms/tasks/FileUploadSection";

const AddTask: React.FC = () => {
  const { t } = useLanguage();
  const {
    formMethods: {
      register,
      handleSubmit,
      errors,
      reset,
      watch,
      getValues,
      setValue,
    },
    selectedEmp,
    setSelectedEmp,
    feedbackMessage,
    setFeedbackMessage,
  } = useTaskForm();

  const { isLightMode } = useCustomTheme();

  const selectedEmployee = watch("emp");
  const selectedDepartment = watch("department_id");
  const selectedProject = watch("project_id");
  const isRecurring = watch("isRecurring");

  const { isEmployeeDisabled, isDepartmentDisabled, isProjectDisabled } =
    useTaskFormState(selectedEmployee, selectedDepartment, selectedProject);

  const { projects, departments, employees } = useTaskQueries(
    selectedProject,
    isProjectDisabled
  );

  const { addTask, isPending } = useTaskSubmit(
    selectedEmployee,
    selectedDepartment,
    isProjectDisabled,
    reset
  );

  const handleFormSubmit = async (data: TaskFormInputs) => {
    setFeedbackMessage(null);
    const target = getTaskTarget(
      selectedEmployee,
      selectedDepartment,
      isProjectDisabled,
      getValues
    );

    const payload = {
      name: getValues("name"),
      description: getValues("description"),
      priority: getValues("priority"),
      files: getValues("files") ?? [],
      due_date: new Date(data.due_date).toISOString(),
      ...target,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== "")
    );

    console.log(filteredPayload);
    addTask(filteredPayload);
  };
  return (
    <GridContainer>
      <div
        className={`${
          isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
        }  p-8 rounded-xl shadow-lg  w-full  col-span-full`}
      >
        <h1 className={`text-center text-2xl text-twhite font-bold mb-6`}>
          {t("Create Task")}
        </h1>
        <form
          className="space-y-4 text-twhite "
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          {/* Fixed Section */}
          <FixedSection
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
          />
          {/* conditional section  */}
          <ConditionalSection
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
            isProjectDisabled={isProjectDisabled}
            isDepartmentDisabled={isDepartmentDisabled}
            isEmployeeDisabled={isEmployeeDisabled}
            projects={projects}
            departments={departments}
            employees={employees}
            selectedEmp={selectedEmp}
            setSelectedEmp={setSelectedEmp}
          />

          {/* File Upload Section */}
          <FileUploadSection
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
            setValue={setValue}
          />

          {/* Recurring Section */}
          <RecurringSection
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
            isRecurring={isRecurring ?? false}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-slate-600 ${
              isLightMode ? " text-tblackAF" : "text-twhite"
            } rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPending}
          >
            {
              <PendingLogic
                isPending={isPending}
                normalText={"Create Task"}
                pendingText={"Creating..."}
              />
            }
          </button>
          {/* Feedback Message */}
          {feedbackMessage && (
            <p
              className={`mt-2 text-center ${
                feedbackMessage.includes("successfully")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {feedbackMessage}
            </p>
          )}
        </form>
      </div>
    </GridContainer>
  );
};

export default AddTask;
