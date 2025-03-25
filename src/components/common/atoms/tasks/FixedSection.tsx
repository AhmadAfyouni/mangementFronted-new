// FixedSection.tsx
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";

interface FixedSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  isLightMode: boolean;
  t: (key: string) => string;
}

export const FixedSection: React.FC<FixedSectionProps> = ({
  register,
  errors,
  isLightMode,
  t,
}) => {
  return (
    <>
      <div>
        <label className="block text-tmid text-sm font-medium">
          {t("Task Name")}
        </label>
        <input
          type="text"
          {...register("name")}
          className={`${
            isLightMode ? "bg-dark" : "bg-secondary"
          } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={t("Enter task name")}
        />
        {errors.name && (
          <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-tmid text-sm font-medium">
          {t("Description")}
        </label>
        <textarea
          {...register("description")}
          className={`${
            isLightMode ? "bg-dark" : "bg-secondary"
          } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={t("Enter task description")}
        />
        {errors.description && (
          <p className="text-red-500 mt-1 text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-tmid text-sm font-medium">
          {t("Priority")}
        </label>
        <select
          {...register("priority")}
          className={`${
            isLightMode ? "bg-dark" : "bg-secondary"
          } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${
            errors.priority ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option className="" value="">
            {t("Select a priority ")}
          </option>
          {["HIGH", "MEDIUM", "LOW"].map((priority, index) => (
            <option className="text-tmid" key={index} value={priority}>
              {t(priority)}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="text-red-500 mt-1 text-sm">{errors.priority.message}</p>
        )}
      </div>

      <div>
        <label className="block text-tmid text-sm font-medium">
          {t("Due Date")}
        </label>
        <input
          type="date"
          {...register("due_date")}
          className={`${
            isLightMode ? "bg-dark" : "bg-secondary"
          } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${
            errors.due_date ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.due_date && (
          <p className="text-red-500 mt-1 text-sm">{errors.due_date.message}</p>
        )}
      </div>
    </>
  );
};
