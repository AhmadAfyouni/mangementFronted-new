/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DynamicSkills from "@/components/common/atoms/job-title/DynamicSkills";
import { FormInput } from "@/components/common/atoms/ui/FormInput";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useAddJobCategory } from "@/hooks/job-category/useAddJobCategory";
import { useEducationExperience } from "@/hooks/job-category/useEducationExperience";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useQueryPageData from "@/hooks/useQueryPageData";
import { addCategorySchema } from "@/schemas/job.schema";
import {
  addEducationService,
  addExperienceService,
} from "@/services/job.service";
import { JobCategoryFormInputs } from "@/types/JobCategory.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const AddJobCategory: React.FC = () => {
  const { isLightMode } = useCustomTheme();
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<JobCategoryFormInputs>({
    resolver: yupResolver(addCategorySchema) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
      required_education: "",
      required_experience: "",
      required_skills: [],
    },
  });
  // @ts-ignore
  const jobCategoryData = useQueryPageData<JobCategoryFormInputs>(reset);
  const [skills, setSkills] = useState<string[]>(
    jobCategoryData?.required_skills || [""]
  );

  useEffect(() => {
    if (jobCategoryData) {
      if (jobCategoryData.required_education) {
        setValue("required_education", jobCategoryData.required_education);
      }

      if (jobCategoryData.required_experience) {
        setValue("required_experience", jobCategoryData.required_experience);
      }

      if (jobCategoryData.name) {
        setValue("name", jobCategoryData.name);
      }

      if (jobCategoryData.description) {
        setValue("description", jobCategoryData.description);
      }

      if (jobCategoryData.required_skills?.length) {
        setSkills(jobCategoryData.required_skills);
        setValue("required_skills", jobCategoryData.required_skills);
      }
    }
  }, [jobCategoryData, setValue]);
  const {
    requiredEducationOptions,
    requiredExperienceOptions,
    setRequiredEducationOptions,
    setRequiredExperienceOptions,
  } = useEducationExperience();
  const {
    addJobCategory,
    errorJobCategory,
    isErrorJobCategory,
    isPendingJobCategory,
  } = useAddJobCategory({
    setSnackbarConfig: setSnackbarConfig,
    jobCategoryData: jobCategoryData,
    reset: () =>
      reset({
        name: "",
        description: "",
        required_education: "",
        required_experience: "",
        required_skills: [],
      }),
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return (
    <GridContainer>
      <div className="bg-droppable-fade text-twhite p-8 rounded-xl shadow-lg col-span-12 w-full">
        <h1 className="text-center text-2xl font-bold mb-6">
          {jobCategoryData
            ? t("Update Job Category")
            : t("Create Job Category")}
        </h1>
        <form
          className="space-y-0"
          onSubmit={handleSubmit(async (data: JobCategoryFormInputs) => {
            addJobCategory(data);
          })}
        >
          {/* Name Field */}
          <FormInput
            label={t("Category Name")}
            placeholder={t("Category Name")}
            name="name"
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
            isRequired={true}
          />

          {/* Description Field */}
          <FormInput
            name="description"
            label={t("Description")}
            placeholder={t("Description")}
            type="textarea"
            register={register}
            errors={errors}
            isLightMode={isLightMode}
            t={t}
            rows={4}
            valueTransformer={(value) => value.trim()}
            isRequired={true}
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Required Education Field */}
            <FormInput
              label={t("Required Education")}
              placeholder={t("Select Required Education")}
              name="required_education"
              type="select"
              register={register}
              errors={errors}
              setValue={setValue}
              isLightMode={isLightMode}
              t={t}
              options={requiredEducationOptions}
              onAddOption={(newEducation) =>
                addEducationService({
                  newEducation,
                  setValue,
                  setRequiredEducationOptions,
                })
              }
              isRequired={true}
            />
            {/* Required Experience Field */}
            <FormInput
              label={t("Required Experience")}
              name="required_experience"
              type="select"
              register={register}
              errors={errors}
              isLightMode={isLightMode}
              t={t}
              placeholder={t("Select Required Experience")}
              options={requiredExperienceOptions}
              onAddOption={async (newExperience) => {
                await addExperienceService({
                  newExperience,
                  setRequiredExperienceOptions: setRequiredExperienceOptions,
                  setValue,
                });
              }}
              isRequired={true}
            />
          </div>

          {/* Required Skills Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("Required Skills")} <span className="text-red-400">*</span>
            </label>
            <DynamicSkills
              skills={skills}
              setSkills={setSkills}
              register={register}
              setValue={setValue}
              errors={errors}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-slate-600 
            
                        ${isLightMode ? " text-tblackAF" : "text-twhite"}

            rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${isPendingJobCategory ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPendingJobCategory}
          >
            {
              <PendingLogic
                isPending={isPendingJobCategory}
                pendingText={
                  jobCategoryData ? t("Updating...") : t("Creating...")
                }
                normalText={
                  jobCategoryData
                    ? t("Update Job Category")
                    : t("Create Job Category")
                }
              />
            }
          </button>
          {isErrorJobCategory && (
            <p className="text-red-500 mt-2 text-center">
              {errorJobCategory + ""}
            </p>
          )}
        </form>
      </div>
    </GridContainer>
  );
};

export default AddJobCategory;