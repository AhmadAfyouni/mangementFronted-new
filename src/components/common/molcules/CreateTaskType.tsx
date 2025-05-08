/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCreateMutation } from "@/hooks/useCreateMutation";
import { addTaskTypeSchema } from "@/schemas/task.schema";
import { CreateTaskTypeProps, TaskTypeFormInputs } from "@/types/Task.type";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

const CreateTaskType: React.FC<CreateTaskTypeProps> = ({
  isOpen,
  onClose,
  taskTypeData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskTypeFormInputs>({
    resolver: yupResolver(addTaskTypeSchema) as any,
    defaultValues: taskTypeData || {},
  });

  useEffect(() => {
    if (taskTypeData) {
      reset(taskTypeData);
    } else {
      reset();
    }
  }, [taskTypeData, reset]);

  const {
    mutate: addTaskType,
    isPending: isPendingTaskType,
    isSuccess: isSuccessTaskType,
    isError: isErrorTaskType,
    error: errorTaskType,
  } = useCreateMutation({
    endpoint: taskTypeData
      ? `/task-type/update/${taskTypeData.id}`
      : `/task-type/create`,
    onSuccessMessage: "Task Type added successfully!",
    invalidateQueryKeys: ["taskTypes"],
    onSuccessFn() {
      reset({ id: "", name: "", description: "" });
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Create/Update Task Type"
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
          {taskTypeData ? "Update Task Type" : "Create Task Type"}
        </h1>
        <form
          className="gap-4"
          onSubmit={handleSubmit(async (data: TaskTypeFormInputs) => {
            addTaskType({
              name: data.name,
              description: data.description,
            });
          })}
        >
          <div>
            <label className="block text-tdark text-sm font-medium">
              Task Type Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 mt-1 rounded-lg border focus:outline-none ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter task type name"
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
            className={`w-full py-2 mt-4 bg-blue-600 text-twhite rounded-lg font-bold hover:bg-blue-700 transition duration-200 ${isPendingTaskType ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPendingTaskType}
          >
            {isPendingTaskType
              ? taskTypeData
                ? "Updating..."
                : "Creating..."
              : taskTypeData
                ? "Update Task Type"
                : "Create Task Type"}
          </button>
          {isErrorTaskType && (
            <p className="text-red-500 mt-2 text-center">
              {errorTaskType + ""}
            </p>
          )}
          {isSuccessTaskType && (
            <p className="text-green-500 mt-2 text-center">
              Added Successfully
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskType;
