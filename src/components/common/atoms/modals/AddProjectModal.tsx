/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { addProjectSchema } from "@/schemas/project.shema";
import { ProjectType } from "@/types/Project.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  CheckSquare,
  Edit2,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Type,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Custom Select component that renders the dropdown directly in a portal
const SelectWithPortal = ({ options, value, onChange, placeholder, isMulti }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(value || []);
  const controlRef = useRef(null);
  const [controlRect, setControlRect] = useState(null);
  const { t } = useTranslation();

  // Update the control position when it opens
  useEffect(() => {
    if (isOpen && controlRef.current) {
      const rect = controlRef.current.getBoundingClientRect();
      setControlRect(rect);
    }
  }, [isOpen]);

  // Handle option selection
  const handleSelectOption = useCallback((option) => {
    if (isMulti) {
      // Check if option is already selected
      const isSelected = selectedOptions.some(o => o.value === option.value);
      let newValue;

      if (isSelected) {
        // Remove the option
        newValue = selectedOptions.filter(o => o.value !== option.value);
      } else {
        // Add the option
        newValue = [...selectedOptions, option];
      }

      setSelectedOptions(newValue);
      onChange(newValue);
    } else {
      setSelectedOptions([option]);
      onChange([option]);
      setIsOpen(false);
    }
  }, [isMulti, onChange, selectedOptions]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlRef.current && !controlRef.current.contains(event.target)) {
        // Check if the click is inside the dropdown portal
        const portal = document.getElementById('select-dropdown-portal');
        if (portal && !portal.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render the main control
  return (
    <div className="relative">
      {/* Main control */}
      <div
        ref={controlRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
        style={{
          minHeight: '50px',
        }}
      >
        <div className="flex flex-wrap gap-1 max-w-[calc(100%-24px)]">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <div
                key={option.value}
                className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOption(option);
                  }}
                  className="ml-1 hover:bg-indigo-700 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400">{placeholder || t("Select...")}</span>
          )}
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Dropdown portal */}
      {isOpen && controlRect && createPortal(
        <div
          id="select-dropdown-portal"
          className="fixed bg-dark border border-gray-700 rounded-lg shadow-lg overflow-auto z-[999999]"
          style={{
            width: controlRect.width,
            maxHeight: '200px',
            top: controlRect.top - 210, // Position above the control
            left: controlRect.left,
          }}
        >
          {options.map(option => {
            const isSelected = selectedOptions.some(o => o.value === option.value);
            return (
              <div
                key={option.value}
                className={`px-4 py-3 cursor-pointer hover:bg-secondary ${isSelected ? 'bg-indigo-600 text-white' : 'text-twhite'}`}
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

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
  const { getDir } = useLanguage()
  const isRTL = getDir() == "rtl"

  const { data: departments, isError: isDeptError } = useCustomQuery<
    DeptTree[]
  >({
    queryKey: ["departments"],
    url: `/department/get-level-one`,
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
  const [isDeptsDropdownOpen, setIsDeptsDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setIsDeptsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[1001]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-[90%] max-w-2xl ${isRTL ? 'rtl' : 'ltr'} max-h-[90vh]`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-main rounded-2xl shadow-2xl border border-secondary overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-5 bg-gradient-to-r from-secondary to-secondary/80 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${projectData ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}>
                        {projectData ? (
                          <Edit2 className="w-6 h-6 text-blue-400" />
                        ) : (
                          <FolderOpen className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-twhite">
                          {projectData ? t("Update Project") : t("Create New Project")}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                          {projectData
                            ? t("Update project details and information")
                            : t("Fill in the details to create a new project")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-dark/50 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto">
                  <form
                    onSubmit={handleSubmit(async (data) => {
                      addOrUpdateProject({
                        ...data,
                        departments: selectedDepartments,
                        adminDepartment: data.adminDepartment
                      });
                    })}
                    className="px-8 py-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Project Name Field */}
                      <div className="md:col-span-2">
                        <label className=" text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Type className="w-4 h-4 text-purple-400" />
                          {t("Project Name")}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            {...register("name")}
                            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
                            placeholder={t("Enter project name")}
                          />
                          {errors.name && (
                            <div className="absolute right-3 top-3.5 text-red-500">
                              <CheckSquare className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        {errors.name && (
                          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Description Field */}
                      <div className="md:col-span-2">
                        <label className=" text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          {t("Description")}
                        </label>
                        <textarea
                          {...register("description")}
                          rows={4}
                          className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors resize-none"
                          placeholder={t("Enter project description")}
                        />
                        {errors.description && (
                          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      {/* Admin Department Field */}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-purple-400" />
                          {t("Admin Department")}
                        </label>
                        <div className="relative">
                          <select
                            {...register("adminDepartment")}
                            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
                          >
                            <option value="">{t("Select Department")}</option>
                            {departments && departments.length > 0 &&
                              departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))
                            }
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Start Date Field */}
                      <div>
                        <label className=" text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          {t("Start Date")}
                        </label>
                        <input
                          type="date"
                          {...register("startDate")}
                          className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors"
                        />
                        {errors.startDate && (
                          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {errors.startDate.message}
                          </p>
                        )}
                      </div>

                      {/* End Date Field */}
                      <div>
                        <label className=" text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-yellow-400" />
                          {t("End Date")}
                        </label>
                        <input
                          type="date"
                          {...register("endDate")}
                          className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                        />
                        {errors.endDate && (
                          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {errors.endDate.message}
                          </p>
                        )}
                      </div>

                      {/* Departments Field */}
                      {departments && !isDeptError && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-400" />
                            {t("Departments")}
                          </label>
                          <div className="relative" ref={deptDropdownRef}>
                            <div
                              className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 focus:outline-none transition-colors cursor-pointer flex items-center justify-between"
                              onClick={() => setIsDeptsDropdownOpen(!isDeptsDropdownOpen)}
                            >
                              <div className="truncate">
                                {selectedDepartments.length > 0
                                  ? selectedDepartments.map(id => departments.find(dept => dept.id === id)?.name).join(', ')
                                  : t("Select Departments...")}
                              </div>
                              <div className="ml-2">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>

                            {isDeptsDropdownOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-dark border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {departments.map(dept => (
                                  <div
                                    key={dept.id}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${selectedDepartments.includes(dept.id) ? 'bg-indigo-700 text-white' : 'text-twhite'
                                      }`}
                                    onClick={() => {
                                      setSelectedDepartments(prev => {
                                        if (prev.includes(dept.id)) {
                                          return prev.filter(id => id !== dept.id);
                                        } else {
                                          return [...prev, dept.id];
                                        }
                                      });
                                    }}
                                  >
                                    {dept.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg bg-dark hover:bg-gray-700 text-twhite hover:text-white transition-colors border border-gray-700"
                        disabled={isPending}
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg
                        ${projectData
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }
                        ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProjectModal;