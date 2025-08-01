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
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/utils/axios/usage";

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

    // Fetch sections
    const { data: sections = [] } = useQuery({
        queryKey: ["sections"],
        queryFn: async () => {
            try {
                const response = await apiClient.get<any>("/sections");
                // Return response.data as that's where the actual data is
                return response.data;
            } catch (error) {
                console.error("Error fetching sections:", error);
                return [];
            }
        },
    });

    // Fetch tasks for parent task selection
    const { data: tasks = [] } = useQuery({
        queryKey: ["tasks", "get-all"],
        queryFn: async () => {
            try {
                const response = await apiClient.get<any>("/tasks/get-all-tasks");
                // Return the tasks array from the response data
                return response.data?.info || [];
            } catch (error) {
                console.error("Error fetching tasks:", error);
                return [];
            }
        },
    });

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

        // Helper function to convert date strings to ISO format
        const toISODate = (dateStr: string | undefined) => {
            if (!dateStr) return undefined;
            try {
                return new Date(dateStr).toISOString();
            } catch {
                return undefined;
            }
        };

        // Helper function to convert string to number
        const toNumber = (value: any) => {
            if (value === undefined || value === null || value === "") return undefined;
            const num = Number(value);
            return isNaN(num) ? undefined : num;
        };

        const payload = {
            name: getValues("name"),
            description: getValues("description"),
            priority: getValues("priority"),
            files: getValues("files") ?? [],
            due_date: toISODate(data.due_date),
            start_date: toISODate(data.start_date),
            section_id: getValues("section_id") || undefined,
            parent_task: getValues("parent_task") || undefined,
            assignee: getValues("assignee") || undefined,
            actual_end_date: toISODate(data.actual_end_date),
            expected_end_date: toISODate(data.expected_end_date),
            estimated_hours: toNumber(getValues("estimated_hours")),
            actual_hours: toNumber(getValues("actual_hours")),
            isRecurring: getValues("isRecurring") || false,
            recurringType: getValues("recurringType") || undefined,
            intervalInDays: toNumber(getValues("intervalInDays")),
            recurringEndDate: toISODate(data.recurringEndDate),
            isRoutineTask: getValues("isRoutineTask") || false,
            routineTaskId: getValues("routineTaskId") || undefined,
            progressCalculationMethod: getValues("progressCalculationMethod") || undefined,
            end_date: toISODate(data.end_date),
            ...target,
        };

        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== "")
        );

        console.log(filteredPayload);
        addTask(filteredPayload);
    };
    return (
        <GridContainer>
            <div
                className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
                    }  p-8 rounded-xl shadow-lg  w-full  col-span-full`}
            >
                <h1 className={`text-center text-2xl text-twhite font-bold mb-6`}>
                    {t("Create Task")}
                </h1>
                <form
                    className="gap-4 text-twhite "
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
                        sections={sections}
                        tasks={tasks}
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
                        className={`w-full py-2 mt-4 bg-slate-600 ${isLightMode ? " text-tblackAF" : "text-twhite"
                            } rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${isPending ? "opacity-50 cursor-not-allowed" : ""
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
                            className={`mt-2 text-center ${feedbackMessage.includes("successfully")
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
