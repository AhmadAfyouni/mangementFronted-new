/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { addTaskStatusSchema } from "@/schemas/task.schema";
import { CreateTaskStatusProps, TaskStatusFormInputs } from "@/types/Task.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

const CreateTaskStatus: React.FC<CreateTaskStatusProps> = ({
  isOpen,
  onClose,
  taskStatusData,
}) => {
  const { setSnackbarConfig } = useMokkBar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskStatusFormInputs>({
    resolver: yupResolver(addTaskStatusSchema) as any,
    defaultValues: taskStatusData || {},
  });

  useEffect(() => {
    if (taskStatusData) {
      reset(taskStatusData);
    } else {
      reset();
    }
  }, [taskStatusData, reset]);

  const {
    mutate: addTaskStatus,
    isPending: isPendingTaskStatus,
    isSuccess: isSuccessTaskStatus,
    isError: isErrorTaskStatus,
    error: errorTaskStatus,
  } = useCreateMutation({
    endpoint: taskStatusData
      ? `/task-status/update/${taskStatusData.id}`
      : `/task-status/create`,
    onSuccessMessage: "Task Status added successfully!",
    invalidateQueryKeys: ["taskStatuses"],
    onSuccessFn() {
      reset({ id: "", name: "", description: "" });
    },
  });

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
      contentLabel="Create/Update Task Status"
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
          {taskStatusData ? "Update Task Status" : "Create Task Status"}
        </h1>
        <form
          className="gap-4"
          onSubmit={handleSubmit(async (data: TaskStatusFormInputs) => {
            addTaskStatus({
              name: data.name,
              description: data.description,
            });
          })}
        >
          <div>
            <label className="block text-tdark text-sm font-medium">
              Task Status Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border focus:outline-none ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter task status name"
            />
            {errors.name && (
              <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-tdark text-sm font-medium">
              Description
            </label>
            <textarea
              {...register("description")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border focus:outline-none ${errors.description ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter description"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-blue-600 text-twhite rounded-lg font-bold hover:bg-blue-700 transition duration-200 ${isPendingTaskStatus ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPendingTaskStatus}
          >
            {isPendingTaskStatus
              ? taskStatusData
                ? "Updating..."
                : "Creating..."
              : taskStatusData
                ? "Update Task Status"
                : "Create Task Status"}
          </button>
          {isErrorTaskStatus && (
            <p className="text-red-500 mt-2 text-center">
              {errorTaskStatus + ""}
            </p>
          )}
          {isSuccessTaskStatus && (
            <p className="text-green-500 mt-2 text-center">
              Added Successfully
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskStatus;
