/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { DynamicFieldArray } from "./FormComponents";
import { useTranslation } from "react-i18next";

const EvaluationSection = ({
  evaluationsFields,
  appendEvaluation,
  removeEvaluation,
  register,
  errors,
  isLightMode,
  reset,
  getValues
}) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 rounded-lg mb-6 border ${isLightMode ? "bg-gray-50 border-gray-200" : "bg-dark border-gray-700"}`}>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
        {t("Performance Evaluations")}
      </h2>

      <DynamicFieldArray
        title="Evaluations"
        fields={evaluationsFields}
        append={() => appendEvaluation({
          evaluation_type: "",
          description: "",
          plan: "",
        })}
        remove={removeEvaluation}
        register={register}
        errors={errors}
        buttonText="Add Evaluation"
        buttonColor="primary"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Evaluation Type")}
              </label>
              <input
                type="text"
                {...register(`evaluations.${index}.evaluation_type`)}
                placeholder={t("Enter evaluation type")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Description")}
              </label>
              <textarea
                {...register(`evaluations.${index}.description`)}
                placeholder={t("Enter description")}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Development Plan")}
              </label>
              <textarea
                {...register(`evaluations.${index}.plan`)}
                placeholder={t("Enter development plan")}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              ></textarea>
            </div>
          </div>
        )}
      </DynamicFieldArray>
    </div>
  );
};

export default EvaluationSection;