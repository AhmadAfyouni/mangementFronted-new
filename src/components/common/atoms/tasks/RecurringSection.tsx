// RecurringSection.tsx
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";

interface RecurringSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  isLightMode: boolean;
  t: (key: string) => string;
  isRecurring: boolean;
}

export const RecurringSection: React.FC<RecurringSectionProps> = ({
  register,
  errors,
  isLightMode,
  t,
  isRecurring,
}) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <div>
          <input
            type="checkbox"
            {...register("isRecurring")}
            className="cursor-pointer"
            id="check-id"
          />
          <label
            htmlFor="check-id"
            className="ml-4 text-tmid text-sm font-medium cursor-pointer"
          >
            {t("Is Recurring Task?")}
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            {...register("isRoutineTask")}
            className="cursor-pointer"
            id="routine-check-id"
          />
          <label
            htmlFor="routine-check-id"
            className="ml-4 text-tmid text-sm font-medium cursor-pointer"
          >
            {t("Is Routine Task?")}
          </label>
        </div>
      </div>

      {isRecurring && (
        <>
          <div>
            <label className="block text-tmid text-sm font-medium">
              {t("Recurring Type")}
            </label>
            <select
              {...register("recurringType")}
              className={`${isLightMode ? "bg-dark" : "bg-secondary"
                } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.recurringType ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option className="" value="">
                {t("Select recurring type")}
              </option>
              {["daily", "weekly", "monthly", "yearly"].map((type, index) => (
                <option className="text-tmid" key={index} value={type}>
                  {t(type.charAt(0).toUpperCase() + type.slice(1))}
                </option>
              ))}
            </select>
            {errors.recurringType && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.recurringType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-tmid text-sm font-medium">
              {t("Recurring Task Interval (Days)")}
            </label>
            <input
              type="number"
              {...register("intervalInDays")}
              className={`${isLightMode ? "bg-dark" : "bg-secondary"
                } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.intervalInDays ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter interval in days")}
            />
            {errors.intervalInDays && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.intervalInDays.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-tmid text-sm font-medium">
                {t("Recurring End Date")}
              </label>
              <input
                type="date"
                {...register("recurringEndDate")}
                className={`${isLightMode ? "bg-dark" : "bg-secondary"
                  } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.recurringEndDate ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.recurringEndDate && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.recurringEndDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-tmid text-sm font-medium">
                {t("End Date")}
              </label>
              <input
                type="date"
                {...register("end_date")}
                className={`${isLightMode ? "bg-dark" : "bg-secondary"
                  } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.end_date && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
