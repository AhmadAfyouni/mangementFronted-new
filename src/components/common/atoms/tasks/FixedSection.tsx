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
          className={`${isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"
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
          className={`${isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.description ? "border-red-500" : "border-gray-300"
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
          className={`${isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.priority ? "border-red-500" : "border-gray-300"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Start Date")}
          </label>
          <input
            type="date"
            {...register("start_date")}
            className={`${isLightMode ? "bg-dark" : "bg-secondary"
              } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.start_date ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.start_date && (
            <p className="text-red-500 mt-1 text-sm">{errors.start_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Due Date")}
          </label>
          <input
            type="date"
            {...register("due_date")}
            className={`${isLightMode ? "bg-dark" : "bg-secondary"
              } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.due_date ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.due_date && (
            <p className="text-red-500 mt-1 text-sm">{errors.due_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Expected End Date")}
          </label>
          <input
            type="date"
            {...register("expected_end_date")}
            className={`${isLightMode ? "bg-dark" : "bg-secondary"
              } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.expected_end_date ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.expected_end_date && (
            <p className="text-red-500 mt-1 text-sm">{errors.expected_end_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Estimated Hours")}
          </label>
          <input
            type="number"
            {...register("estimated_hours")}
            className={`${isLightMode ? "bg-dark" : "bg-secondary"
              } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.estimated_hours ? "border-red-500" : "border-gray-300"
              }`}
            placeholder={t("Enter estimated hours")}
          />
          {errors.estimated_hours && (
            <p className="text-red-500 mt-1 text-sm">{errors.estimated_hours.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-tmid text-sm font-medium">
          {t("Progress Calculation Method")}
        </label>
        <select
          {...register("progressCalculationMethod")}
          className={`${isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.progressCalculationMethod ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option className="" value="">
            {t("Select a calculation method")}
          </option>
          <option className="text-tmid" value="time_based">
            {t("Time Based")}
          </option>
          <option className="text-tmid" value="date_based">
            {t("Date Based")}
          </option>
        </select>
        {errors.progressCalculationMethod && (
          <p className="text-red-500 mt-1 text-sm">{errors.progressCalculationMethod.message}</p>
        )}
      </div>
    </>
  );
};
