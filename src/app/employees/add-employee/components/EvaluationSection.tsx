/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AlertCircle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const EvaluationSection = ({
  evaluationsFields,
  appendEvaluation,
  removeEvaluation,
  register,
  errors,
  reset,
  getValues
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg mb-6 border bg-dark border-gray-700">
      <div className="mb-4">
        {evaluationsFields.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t("No evaluations added yet")}</div>
        ) : (
          <div className="space-y-4">
            {evaluationsFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-dark border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Evaluation Type */}
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Evaluation Type")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`evaluations.${index}.evaluation_type`)}
                        placeholder={t("Enter evaluation type")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-pink-500 focus:ring focus:ring-pink-500/20 focus:outline-none transition-colors"
                      />
                      {errors.evaluations?.[index]?.evaluation_type && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.evaluations?.[index]?.evaluation_type && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.evaluations[index].evaluation_type.message}
                      </p>
                    )}
                  </div>
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Description")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        {...register(`evaluations.${index}.description`)}
                        placeholder={t("Enter description")}
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-pink-500 focus:ring focus:ring-pink-500/20 focus:outline-none transition-colors resize-none"
                      ></textarea>
                      {errors.evaluations?.[index]?.description && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.evaluations?.[index]?.description && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.evaluations[index].description.message}
                      </p>
                    )}
                  </div>
                  {/* Plan */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Plan")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        {...register(`evaluations.${index}.plan`)}
                        placeholder={t("Enter development plan")}
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-pink-500 focus:ring focus:ring-pink-500/20 focus:outline-none transition-colors resize-none"
                      ></textarea>
                      {errors.evaluations?.[index]?.plan && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.evaluations?.[index]?.plan && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.evaluations[index].plan.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { removeEvaluation(index); reset(getValues()); }} className="text-red-400 hover:underline text-sm flex items-center gap-1">
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => appendEvaluation({ evaluation_type: "", description: "", plan: "" })} className="flex items-center gap-1 text-pink-400/60 hover:underline">
            <Star className="w-4 h-4" /> {t("Add Evaluation")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSection;