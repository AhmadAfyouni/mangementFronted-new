/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import ConditionalDropdowns from "@/components/common/atoms/job-title/ConditionalDropdowns";
import IsManagerToggle from "@/components/common/atoms/job-title/IsManagerToggle";
import { PermissionsSection } from "@/components/common/atoms/job-title/PermissionsSection";
import TitleFormInput from "@/components/common/atoms/job-title/TitleFormInput";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useJobTitleForm } from "@/hooks/job-title/useJobTitleForm";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import { getDepartmentOptions } from "@/services/job.service";
import { DepartmentType } from "@/types/DepartmentType.type";
import { JobCategoryType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import DynamicResponsibilities from "@/components/common/atoms/job-title/DynamicResponsibilities";

const AddJobTitle: React.FC = () => {
  const [permissionsMode, setPermissionsMode] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [permissionsSelected, setPermissionsSelected] = useState<string[]>([]);
  const [specificDept, setSpecificDept] = useState<string[]>([]);
  const [specificEmp, setSpecificEmp] = useState<string[]>([]);
  const [specificJobTitle, setSpecificJobTitle] = useState<string[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useTranslation();
  const { isLightMode } = useCustomTheme();
  const {
    addJobTitle,
    errorJobTitle,
    errors,
    getValues,
    handleSubmit,
    isErrorJobTitle,
    isPendingJobTitle,
    register,
    reset,
    setValue,
    jobTitleData,
  } = useJobTitleForm();

  const { data: departments } = useCustomQuery<{
    info: DepartmentType[];
    tree: DeptTree[];
  }>({
    queryKey: ["departments"],
    url: `/department/tree`,
  });
  const { data: categories } = useCustomQuery<JobCategoryType[]>({
    queryKey: ["categories"],
    url: `/job-categories`,
  });

  useEffect(() => {
    if (jobTitleData) {
      console.log("job title data : ", jobTitleData);

      reset(jobTitleData);
      setResponsibilities(jobTitleData.responsibilities || []);
      setValue("department_id", jobTitleData.department._id);
      setValue("category", jobTitleData.category.id);
      setSelectedCategory(jobTitleData.category.id);
      setSelectedDept(jobTitleData.department._id);
      setPermissionsSelected(jobTitleData.permissions || []);
      setSpecificDept(jobTitleData.accessibleDepartments || []);
      setSpecificEmp(jobTitleData.accessibleEmps || []);
      setSpecificJobTitle(jobTitleData.accessibleJobTitles || []);
      setIsManager(jobTitleData.is_manager);
      setPermissionsMode(
        jobTitleData.permissions.length > 0 ? "custom" : "default"
      );
    } else {
      reset();
      setResponsibilities([]);
    }
  }, [
    jobTitleData,
    reset,
    setValue,
    setPermissionsMode,
    setSelectedCategory,
    setSelectedDept,
  ]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return (
    <GridContainer>
      <div className="bg-droppable-fade p-8 rounded-xl shadow-lg col-span-12 w-full text-twhite">
        <h1 className="text-center text-2xl  font-bold mb-6">
          {jobTitleData ? t("Update Job Title") : t("Create Job Title")}
        </h1>
        <form
          className="gap-4"
          onSubmit={handleSubmit(async (data) => {
            console.log({
              ...data,
              permissions: permissionsSelected,
              is_manager: isManager,
              accessibleDepartments: specificDept,
              accessibleEmps: specificEmp,
              accessibleJobTitles: specificJobTitle,
              responsibilities,
            });

            addJobTitle({
              ...data,
              permissions: permissionsSelected,
              is_manager: isManager,
              accessibleDepartments: specificDept,
              accessibleEmps: specificEmp,
              accessibleJobTitles: specificJobTitle,
              responsibilities: getValues("responsibilities"),
            });
          })}
        >
          <TitleFormInput
            name="title"
            label={t("Title")}
            placeholder={t("Enter job title")}
            errors={errors}
            register={register}
          />
          <TitleFormInput
            name="description"
            label={t("Description")}
            placeholder={t("Enter job description")}
            errors={errors}
            register={register}
          />
          <DynamicResponsibilities
            responsibilities={responsibilities}
            setResponsibilities={setResponsibilities}
            register={register}
            setValue={setValue}
            errors={errors}
          />
          <PermissionsSection
            permissionsMode={permissionsMode}
            setPermissionsMode={setPermissionsMode}
            permissionsSelected={permissionsSelected}
            setPermissionsSelected={setPermissionsSelected}
          />
          {/* Conditional Dropdowns */}
          <ConditionalDropdowns
            departments={departments}
            getDepartmentOptions={getDepartmentOptions}
            permissionsSelected={permissionsSelected}
            specificDept={specificDept}
            setSpecificDept={setSpecificDept}
            register={register}
            setSpecificEmp={setSpecificEmp}
            setSpecificJobTitle={setSpecificJobTitle}
            specificEmp={specificEmp}
            specificJobTitle={specificJobTitle}
          />
          <TitleFormInput
            name="category"
            label={t("Job Category")}
            placeholder={t("Select a Job Category")}
            type="select"
            selectedOption={selectedCategory}
            options={categories}
            errors={errors}
            register={register}
            onChange={setSelectedCategory}
          />
          <TitleFormInput
            name="department_id"
            label={t("Department")}
            placeholder={t("Select a Department")}
            type="select"
            selectedOption={selectedDept}
            options={departments?.tree}
            errors={errors}
            register={register}
            onChange={setSelectedDept}
          />
          {/* Is Manager Checkbox */}
          <IsManagerToggle isManager={isManager} setIsManager={setIsManager} />
          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-slate-600 
              ${isLightMode ? " text-tblackAF" : "text-twhite"}
            rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${isPendingJobTitle ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPendingJobTitle}
          >
            {
              <PendingLogic
                isPending={isPendingJobTitle}
                normalText={
                  jobTitleData ? "Update Job Title" : "Create Job Title"
                }
                pendingText={jobTitleData ? "Updating..." : "Creating..."}
              />
            }
          </button>
          {isErrorJobTitle && (
            <p className="text-red-500 mt-2 text-center">
              {errorJobTitle + ""}
            </p>
          )}
        </form>
      </div>
    </GridContainer>
  );
};

export default AddJobTitle;
