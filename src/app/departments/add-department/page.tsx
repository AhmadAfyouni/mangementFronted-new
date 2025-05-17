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
import { ArrowLeft, Briefcase, Building2, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const AddDept = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLightMode } = useCustomTheme();

  // Track if this is the first render
  const initialRenderRef = React.useRef(true);

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
  } = useAddDeptLogic(reset);

  const { mutate: addDepartment, isPending: isPendingDepartment } =
    useCreateMutation({
      endpoint: departmentData
        ? `/department/updateDepartment/${departmentData.id}`
        : `/department/create-department`,
      onSuccessMessage: departmentData
        ? "Department updated successfully!"
        : "Department created successfully!",
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

  // Handle initialization after the component mounts and data is loaded
  useEffect(() => {
    if (departmentData && initialRenderRef.current) {
      // This ensures we only run this once
      initialRenderRef.current = false;

      // Initialize parent department correctly
      if (departmentData.parent_department) {
        const parentId = typeof departmentData.parent_department === 'object'
          ? (departmentData.parent_department as { id: string })?.id
          : departmentData.parent_department as string;

        console.log('Setting parent_department_id to:', parentId);
        setValue('parent_department_id', parentId);
      }

      // Initialize category correctly
      if (departmentData.category) {
        console.log('Setting category to:', departmentData.category);
        setValue('category', departmentData.category);
      }
    }
  }, [departmentData, setValue]);

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Get category icon based on category value
  const getCategoryIcon = (category: string) => {
    if (category === 'primary-department') {
      return <Building2 className="w-5 h-5 text-blue-400" />;
    } else if (category === 'secondary-department') {
      return <Briefcase className="w-5 h-5 text-purple-400" />;
    } else {
      return <FileText className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <GridContainer>
      <div className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"} p-8 rounded-xl shadow-lg w-full col-span-full text-twhite`}>
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to Departments")}
        </button>

        {/* Header with icon */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
          <div className={`p-4 rounded-xl ${departmentData && departmentData.category ?
            departmentData.category === 'primary-department' ? 'bg-blue-900/30' :
              departmentData.category === 'secondary-department' ? 'bg-purple-900/30' :
                'bg-green-900/30' : 'bg-blue-900/30'}`}>
            {departmentData && departmentData.category ?
              getCategoryIcon(departmentData.category) :
              <Building2 className="w-5 h-5 text-blue-400" />}
          </div>
          <div>
            <h1 className="text-2xl text-twhite font-bold">
              {departmentData ? t("Update Department") : t("Create Department")}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {departmentData
                ? t("Update the details for this department")
                : t("Fill in the details to create a new department")}
            </p>
          </div>
        </div>

        <form
          className="gap-6 text-twhite space-y-6"
          onSubmit={handleSubmit(() =>
            handleManualSubmit({
              getValues,
              addDepartment,
            })
          )}
        >
          {/* Main form fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-secondary p-6 rounded-xl shadow-md">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">{t("Basic Information")}</h2>
              </div>

              <DeptFormInput
                label={t("Department Name")}
                placeholder={t("Enter department name")}
                value={departmentData && departmentData.name}
                onChange={(e) => setValue("name", e.target.value)}
                className="bg-dark border border-dark/40 rounded-lg"
              />

              {/* Category Field with enhanced UI */}
              <div className="w-full">
                <DeptFormInput
                  type="select"
                  label={t("Category")}
                  placeholder={t("Select Category")}
                  selectOptions={requiredCategoryOptions}
                  value={departmentData?.category || ''}
                  onChange={(e) => setValue("category", e.target.value)}
                  showAddButton={true}
                  onAddClick={() => setIsAddingCategory(true)}
                  className="bg-dark border border-dark/40 rounded-lg"
                />
                {isAddingCategory && (
                  <div className="mt-2 p-3 bg-dark/50 border border-dark/40 rounded-lg animate-fadeIn">
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
                  </div>
                )}
                {errors.category && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <DeptFormInput
                type="select"
                label={t("Parent Department")}
                value={departmentData?.parent_department ?
                  (typeof departmentData.parent_department === 'object' && departmentData.parent_department !== null) ?
                    (departmentData.parent_department as { id: string }).id : departmentData.parent_department as string :
                  ''}
                onChange={(e) => setValue("parent_department_id", e.target.value)}
                placeholder={t("Select a parent department")}
                selectOptions={
                  departments &&
                  departments.tree &&
                  departments.tree.map((dept) => {
                    return { label: dept.name, value: dept.id };
                  })
                }
                className="bg-dark border border-dark/40 rounded-lg"
              />
            </div>

            <div className="space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold">{t("Department Details")}</h2>
              </div>

              <DeptFormInput
                label={t("Goal")}
                placeholder={t("Enter department goal")}
                value={departmentData && departmentData.goal}
                onChange={(e) => setValue("goal", e.target.value)}
                className="bg-dark border border-dark/40 rounded-lg"
              />

              <DeptFormInput
                isTextArea={true}
                label={t("Main Tasks")}
                placeholder={t("Enter main tasks")}
                value={departmentData && departmentData.mainTasks}
                onChange={(e) => setValue("mainTasks", e.target.value)}
                rows={4}
                className="bg-dark border border-dark/40 rounded-lg"
              />
            </div>
          </div>

          {/* Additional sections with enhanced styling */}
          <div className="bg-secondary p-6 rounded-xl shadow-md">
            <DeptAdditionalSection
              availableCategories={availableCategories}
              developmentProgramsFields={developmentProgramsFields}
              numericOwnersFields={numericOwnersFields}
              requiredReportsFields={requiredReportsFields}
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
              departmentId={departmentData?.id}
              isLightMode={isLightMode}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-800">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm
                  ${isLightMode
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-dark text-gray-300 hover:bg-gray-800"}
                `}
              >
                {t("Cancel")}
              </button>

              <button
                type="submit"
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow hover:shadow-md
                  flex items-center gap-2
                  ${isPendingDepartment ? "opacity-70 cursor-not-allowed" : ""}
                  ${isLightMode
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"}
                `}
                disabled={isPendingDepartment}
              >
                <Save className="w-5 h-5" />
                <PendingLogic
                  isPending={isPendingDepartment}
                  normalText={
                    departmentData ? t("Update Department") : t("Create Department")
                  }
                  pendingText={departmentData ? t("Updating...") : t("Creating...")}
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </GridContainer>
  );
};

export default AddDept;