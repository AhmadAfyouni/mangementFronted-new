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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-[90%] max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-secondary rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-700 bg-dark/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {projectData ? (
                      <Edit2 className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FolderOpen className="w-5 h-5 text-purple-400" />
                    )}
                    <h2 className="text-xl font-bold text-twhite">
                      {projectData ? t("Update Project") : t("Create New Project")}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form
                onSubmit={handleSubmit(async (data) => {
                  addOrUpdateProject({
                    ...data,
                    departments: selectedDepartments,
                  });
                })}
                className="p-6"
              >
                <div className="space-y-4">
                  {/* Project Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t("Project Name")}
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full px-4 py-3 rounded-lg bg-dark text-twhite border 
                        ${errors.name ? 'border-red-500' : 'border-gray-700'} 
                        focus:border-blue-500 focus:outline-none transition-colors
                        ${isLightMode ? 'bg-darker text-tblackAF' : ''}`}
                      placeholder={t("Enter project name")}
                    />
                    {errors.name && (
                      <p className="text-red-400 mt-1 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t("Description")}
                    </label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg bg-dark text-twhite border 
                        ${errors.description ? 'border-red-500' : 'border-gray-700'} 
                        focus:border-blue-500 focus:outline-none transition-colors resize-none
                        ${isLightMode ? 'bg-darker text-tblackAF' : ''}`}
                      placeholder={t("Enter project description")}
                    />
                    {errors.description && (
                      <p className="text-red-400 mt-1 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {t("Start Date")}
                      </label>
                      <input
                        type="date"
                        {...register("startDate")}
                        className={`w-full px-4 py-3 rounded-lg bg-dark text-twhite border 
                          ${errors.startDate ? 'border-red-500' : 'border-gray-700'} 
                          focus:border-blue-500 focus:outline-none transition-colors
                          ${isLightMode ? 'bg-darker text-tblackAF' : ''}`}
                      />
                      {errors.startDate && (
                        <p className="text-red-400 mt-1 text-sm">
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>

                    {/* End Date Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {t("End Date")}
                      </label>
                      <input
                        type="date"
                        {...register("endDate")}
                        className={`w-full px-4 py-3 rounded-lg bg-dark text-twhite border 
                          ${errors.endDate ? 'border-red-500' : 'border-gray-700'} 
                          focus:border-blue-500 focus:outline-none transition-colors
                          ${isLightMode ? 'bg-darker text-tblackAF' : ''}`}
                      />
                      {errors.endDate && (
                        <p className="text-red-400 mt-1 text-sm">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Departments Field */}
                  {departments && !isDeptError && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <Building2 className="inline w-4 h-4 mr-1" />
                        {t("Departments")}
                      </label>
                      <Select
                        isMulti
                        value={selectedDepartments.map((id) => ({
                          value: id,
                          label:
                            departments && departments.find((dept) => dept.id === id)?.name || "",
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
                        className="text-sm"
                        placeholder={t("Select Departments...")}
                        styles={{
                          ...selectStyle,
                          control: (base) => ({
                            ...base,
                            backgroundColor: isLightMode ? '#1f2937' : '#111827',
                            borderColor: '#374151',
                            minHeight: '48px',
                            '&:hover': {
                              borderColor: '#3b82f6',
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: isLightMode ? '#1f2937' : '#111827',
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? '#3b82f6'
                              : state.isFocused
                              ? '#1f2937'
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: '#1f2937',
                            },
                          }),
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-700 text-twhite hover:bg-gray-600 transition-colors"
                    disabled={isPending}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                      ${projectData
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }
                      ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {projectData ? t("Updating...") : t("Creating...")}
                      </>
                    ) : (
                      <>
                        {projectData ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {projectData ? t("Update Project") : t("Create Project")}
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProjectModal;
