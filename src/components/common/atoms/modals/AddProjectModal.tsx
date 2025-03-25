/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import { addProjectSchema } from "@/schemas/project.shema";
import { ProjectType } from "@/types/Project.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { selectStyle } from "@/utils/SelectStyle";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from "react-select";

const AddProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectData?: ProjectType;
}> = ({ isOpen, onClose, projectData }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(addProjectSchema(!!projectData)),
    context: { isEditing: !!projectData },
  });
  const { isLightMode } = useCustomTheme();
  // const isAdmin = useRolePermissions("admin");
  // const isPrimary = useRolePermissions("primary_user");

  const { data: departments, isError: isDeptError } = useCustomQuery<
    DeptTree[]
  >({
    queryKey: ["departments"],
    url: `/department/${
      // isAdmin || isPrimary ? "get-departments" : "view"
      "get-level-one"
    }`,
  });

  const { mutate: addOrUpdateProject, isPending } = useCreateMutation({
    endpoint: projectData ? `/projects/update/${projectData._id}` : "/projects",
    onSuccessMessage: projectData
      ? `Project updated successfully!`
      : `Project added successfully!`,
    invalidateQueryKeys: ["projects"],
    onSuccessFn() {
      reset();
      setSelectedDepartments([]);
      setTimeout(onClose, 500);
    },
  });

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (projectData && projectData.departments) {
      reset({
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate
          ? projectData.startDate.slice(0, 10)
          : "",
        endDate: projectData.endDate ? projectData.endDate.slice(0, 10) : "",
      });

      if (
        projectData &&
        projectData.departments &&
        projectData.departments.length > 0
      ) {
        setSelectedDepartments(projectData.departments.map((dept) => dept._id));
      }
    }
  }, [projectData, reset]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-secondary rounded-xl shadow-md w-[400px] text-twhite space-y-4 p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="text-twhite absolute top-4 right-4 text-xl"
          >
            &times;
          </button>
          <div>
            <form
              onSubmit={handleSubmit(async (data) => {
                addOrUpdateProject({
                  ...data,
                  departments: selectedDepartments,
                });
              })}
            >
              {/* Project Name Field */}
              <div>
                <label className="block text-twhite text-sm font-medium">
                  {t("Project Name")}
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-2 mt-1 bg-main text-tmid outline-none rounded-lg ${
                    errors.name ? "border border-red-500" : "border-none"
                  }`}
                  placeholder={t("Enter project name")}
                />
                {errors.name && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-twhite text-sm font-medium">
                  {t("Description")}
                </label>
                <textarea
                  {...register("description")}
                  className={`w-full px-4 py-2 mt-1 bg-main text-tmid outline-none rounded-lg ${
                    errors.description ? "border border-red-500" : "border-none"
                  }`}
                  placeholder={t("Enter project description")}
                />
                {errors.description && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Start Date Field */}
              <div>
                <label className="block text-twhite text-sm font-medium">
                  {t("Start Date")}
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={`w-full px-4 py-2 mt-1 bg-main text-tmid outline-none rounded-lg ${
                    errors.startDate ? "border border-red-500" : "border-none"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* End Date Field */}
              <div>
                <label className="block text-twhite text-sm font-medium">
                  {t("End Date")}
                </label>
                <input
                  type="date"
                  {...register("endDate")}
                  className={`w-full px-4 py-2 mt-1 bg-main text-tmid outline-none rounded-lg ${
                    errors.endDate ? "border border-red-500" : "border-none"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              {/* Departments Field */}
              {departments && !isDeptError && (
                <div>
                  <label className="block text-sm font-medium">
                    {t("Departments")}
                  </label>
                  <Select
                    isMulti
                    value={selectedDepartments.map((id) => ({
                      value: id,
                      label:
                        departments?.find((dept) => dept.id === id)?.name || "",
                    }))}
                    options={
                      departments && departments.length > 0
                        ? departments.map((dept) => ({
                            value: dept.id,
                            label: dept.name,
                          }))
                        : []
                    }
                    onChange={(selectedOptions) => {
                      setSelectedDepartments(
                        selectedOptions.map((option) => option.value)
                      );
                    }}
                    className="mt-1 text-tblackAF"
                    placeholder={t("Select Departments...")}
                    styles={selectStyle}
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2 mt-4 ${
                  isLightMode
                    ? " bg-darkest text-tblackAF"
                    : " bg-tblack text-twhite"
                } rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${
                  isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isPending}
              >
                {isPending ? t("Processing...") : t("Submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProjectModal;
