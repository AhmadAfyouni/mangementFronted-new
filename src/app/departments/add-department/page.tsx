/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import AddCategoryField from "@/components/common/atoms/departments/AddCategoryField";
import DeptAdditionalSection from "@/components/common/atoms/departments/DeptAdditionalSection";
import DeptFormInput from "@/components/common/atoms/departments/DeptFormInput";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import { useAddDeptLogic } from "@/hooks/departments/useAddDepartment";
import { useAddDeptForm } from "@/hooks/departments/useAddDeptForm";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomTheme from "@/hooks/useCustomTheme";
import {
  handleAddCategory,
  handleAddNumericOwner,
  handleManualSubmit,
} from "@/services/department.service";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const AddDept = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLightMode } = useCustomTheme();

  const {
    appendDevelopmentProgram,
    appendNumericOwner,
    appendRequiredReport,
    developmentProgramsFields,
    errors,
    getValues,
    handleSubmit,
    numericOwnersFields,
    register,
    removeDevelopmentProgram,
    removeNumericOwner,
    removeRequiredReport,
    requiredReportsFields,
    setValue,
    reset,
  } = useAddDeptForm();

  const {
    availableCategories,
    departmentData,
    departments,
    isAddingCategory,
    newCategory,
    requiredCategoryOptions,
    setIsAddingCategory,
    setNewCategory,
    setRequiredCategoryOptions,
    setSupportingFiles,
    supportingFiles,
  } = useAddDeptLogic(reset);

  const { mutate: addDepartment, isPending: isPendingDepartment } =
    useCreateMutation({
      endpoint: departmentData
        ? `/department/updateDepartment/${departmentData.id}`
        : `/department/create-department`,
      onSuccessMessage: "Departments added successfully!",
      invalidateQueryKeys: ["departments"],
      onSuccessFn: () => {
        reset({
          id: "",
          parent_department_id: "",
          description: "",
          name: "",
          goal: "",
          category: "",
          mainTasks: "",
          numericOwners: [],
          supportingFiles: [],
          requiredReports: [],
          developmentPrograms: [],
        });
        setSupportingFiles([]);
        setTimeout(() => router.back(), 1000);
      },
    });

  return (
    <GridContainer>
      <div
        className={`${
          isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
        }  p-8 rounded-xl shadow-lg  w-full  col-span-full  text-twhite`}
      >
        <h1 className=" text-2xl text-twhite font-bold mb-6">
          {departmentData ? t("Update Department") : t("Create Department")}
        </h1>
        <form
          className="space-y-4 text-twhite"
          onSubmit={handleSubmit(() =>
            handleManualSubmit({
              getValues,
              addDepartment,
            })
          )}
        >
          <div className="flex gap-5 items-center justify-between">
            <DeptFormInput
              label={t("Department Name")}
              placeholder={t("Enter department name")}
              value={departmentData && departmentData.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
            <DeptFormInput
              label={t("Goal")}
              placeholder={t("Enter department goal")}
              value={departmentData && departmentData.goal}
              onChange={(e) => setValue("goal", e.target.value)}
            />

            {/* Category Field */}
            <div className="w-full">
              <DeptFormInput
                type="select"
                label={t("Category")}
                placeholder={t("Select Category")}
                selectOptions={requiredCategoryOptions}
                value={departmentData && departmentData.category}
                onChange={(e) => setValue("category", e.target.value)}
                showAddButton={true}
                onAddClick={() => setIsAddingCategory(true)}
              />
              {isAddingCategory && (
                <AddCategoryField
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onClick={() =>
                    handleAddCategory(
                      newCategory,
                      setNewCategory,
                      setRequiredCategoryOptions,
                      setIsAddingCategory,
                      setValue
                    )
                  }
                />
              )}
              {errors.category && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <DeptFormInput
            isTextArea={true}
            label={t("Main Tasks")}
            placeholder={t("Enter main tasks")}
            value={departmentData && departmentData.mainTasks}
            onChange={(e) => setValue("mainTasks", e.target.value)}
            rows={2}
          />

          <DeptFormInput
            type="select"
            label={t("Parent Department")}
            value={departmentData && departmentData.parent_department}
            onChange={(e) => setValue("parent_department_id", e.target.value)}
            placeholder={t("Select a parent department")}
            selectOptions={
              departments &&
              departments.tree &&
              departments.tree.map((dept) => {
                return { label: dept.name, value: dept.id };
              })
            }
          />

          <DeptAdditionalSection
            availableCategories={availableCategories}
            developmentProgramsFields={developmentProgramsFields}
            numericOwnersFields={numericOwnersFields}
            requiredReportsFields={requiredReportsFields}
            supportingFiles={supportingFiles}
            errors={errors}
            appendDevelopmentProgram={appendDevelopmentProgram}
            appendNumericOwner={appendNumericOwner}
            appendRequiredReport={appendRequiredReport}
            handleAddNumericOwner={handleAddNumericOwner}
            register={register}
            removeDevelopmentProgram={removeDevelopmentProgram}
            removeNumericOwner={removeNumericOwner}
            removeRequiredReport={removeRequiredReport}
            setValue={setValue}
            getValues={getValues}
            setSupportingFiles={setSupportingFiles}
          />

          <button
            type="submit" // Change to "button" to avoid default form submission
            className={`w-full py-2 mt-4 bg-slate-600  rounded-lg font-bold hover:bg-slate-700 transition duration-300 ${
              isPendingDepartment ? "opacity-50 cursor-not-allowed" : ""
            }
              
              ${isLightMode ? " text-tblackAF" : "text-twhite"}

              `}
            disabled={isPendingDepartment}
          >
            {
              <PendingLogic
                isPending={isPendingDepartment}
                normalText={
                  departmentData ? "Update Department" : "Create Department"
                }
                pendingText={departmentData ? "Updating..." : "Creating..."}
              />
            }
          </button>
        </form>
      </div>
    </GridContainer>
  );
};

export default AddDept;
