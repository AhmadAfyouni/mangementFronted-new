/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { addTaskPopupSchema } from "@/schemas/task.schema";
import { DepartmentType } from "@/types/DepartmentType.type";
import { EmployeeType } from "@/types/EmployeeType.type";
import { CreateTaskProps, TaskFormInputs } from "@/types/Task.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import CreateTaskStatus from "../molcules/CreateTaskStatus";
import CreateTaskType from "../molcules/CreateTaskType";

const CreateTask: React.FC<CreateTaskProps> = ({
  isOpen,
  onClose,
  taskData,
}) => {
  const [isEmployeeDisabled, setIsEmployeeDisabled] = useState(false);
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(false);
  const [isTaskStatusModalOpen, setIsTaskStatusModalOpen] = useState(false);
  const [isTaskTypeModalOpen, setIsTaskTypeModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TaskFormInputs>({
    resolver: yupResolver(addTaskPopupSchema) as any,
    defaultValues: taskData || {},
  });

  const selectedEmployee = watch("emp");
  const selectedDepartment = watch("department_id");

  useEffect(() => {
    if (taskData) {
      reset(taskData);
    } else {
      reset();
    }
  }, [taskData, reset]);

  const { data: departments } = useCustomQuery<DepartmentType[]>({
    queryKey: ["departments"],
    url: `/department/get-departments`,
  });

  const { data: employees } = useCustomQuery<EmployeeType[]>({
    queryKey: ["employees"],
    url: `/emp/get-all-emps`,
  });

  const { mutate: addTask, isPending } = useCreateMutation({
    endpoint: taskData ? `/tasks/update/${taskData.id}` : `/tasks/create`,
    onSuccessMessage: "Task added successfully!",
    invalidateQueryKeys: ["tasks"],
    onSuccessFn() {
      setSnackbarConfig({
        open: true,
        message: taskData
          ? "Task updated successfully!"
          : "Task created successfully!",
        severity: "success",
      });
      reset();
    },
  });

  const onSubmit = async (data: TaskFormInputs) => {
    setFeedbackMessage(null);
    addTask({
      ...data,
      due_date: new Date(data.due_date).toISOString(),
    });
    setInterval(onClose, 3000);
  };

  useEffect(() => {
    if (selectedEmployee) {
      setIsDepartmentDisabled(true);
    } else {
      setIsDepartmentDisabled(false);
    }

    if (selectedDepartment) {
      setIsEmployeeDisabled(true);
    } else {
      setIsEmployeeDisabled(false);
    }
  }, [selectedEmployee, selectedDepartment]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Create/Update Task"
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-tblack hover:text-red-500"
        >
          &times;
        </button>
        <h1 className="text-center text-2xl font-bold mb-6">
          {taskData ? "Update Task" : "Create Task"}
        </h1>
        <form className="gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Task Name")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter task name")}
            />

            {errors.name && (
              <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Description")} <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("description")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.description ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter task description")}
            />
            {errors.description && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Priority")} <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              {...register("priority")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.priority ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter priority")}
            />
            {errors.priority && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Employee Field */}
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Assigned Employee")}
            </label>
            <select
              {...register("emp")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.emp ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isEmployeeDisabled} // Disable based on selection
            >
              <option value="">{t("Select an employee")}</option>
              {employees &&
                employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
            </select>
            {errors.emp && (
              <p className="text-red-500 mt-1 text-sm">{errors.emp.message}</p>
            )}
          </div>

          {/* Department Field */}
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Department")}
            </label>
            <select
              {...register("department_id")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.department_id ? "border-red-500" : "border-gray-300"
                }`}
              disabled={isDepartmentDisabled}
            >
              <option value="">{t("Select a department")}</option>
              {departments &&
                departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
            {errors.department_id && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.department_id.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-tdark text-sm font-medium">
              {t("Due Date")} <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              {...register("due_date")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border ${errors.due_date ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.due_date && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.due_date.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-blue-600 text-twhite rounded-lg font-bold hover:bg-blue-700 transition duration-200 ${isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPending}
          >
            {isPending
              ? taskData
                ? t("Updating...")
                : t("Creating...")
              : taskData
                ? t("Update Task")
                : t("Create Task")}
          </button>

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

      <CreateTaskStatus
        isOpen={isTaskStatusModalOpen}
        onClose={() => setIsTaskStatusModalOpen(false)}
      />
      <CreateTaskType
        isOpen={isTaskTypeModalOpen}
        onClose={() => setIsTaskTypeModalOpen(false)}
      />
    </Modal>
  );
};

export default CreateTask;
