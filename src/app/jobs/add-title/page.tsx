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
import { CreateRoutineTaskDto, JobCategoryType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DynamicResponsibilities from "@/components/common/atoms/job-title/DynamicResponsibilities";
import { ChevronDown, ChevronUp, Save, AlertTriangle, Plus, Clock, Trash2, Bookmark, Calendar, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/utils/axios/usage";

// Form section types for the multi-step form
const FORM_SECTIONS = {
  BASIC_INFO: "basic_info",
  RESPONSIBILITIES: "responsibilities",
  PERMISSIONS: "permissions",
  ROUTINE_TASKS: "routine_tasks",
  DEPARTMENT_INFO: "department_info"
};

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
  const [routineTasks, setRoutineTasks] = useState<CreateRoutineTaskDto[]>([]);
  const [hasRoutineTasks, setHasRoutineTasks] = useState(false);
  const [autoGenerateRoutineTasks, setAutoGenerateRoutineTasks] = useState(true);
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useTranslation();
  const { isLightMode } = useCustomTheme();
  const searchParams = useSearchParams();
  const jobTitleId = searchParams.get('id');
  const isEditMode = !!jobTitleId;

  // State for enhanced UX
  const [activeSection, setActiveSection] = useState(FORM_SECTIONS.BASIC_INFO);
  const [expandedSections, setExpandedSections] = useState({
    [FORM_SECTIONS.BASIC_INFO]: true,
    [FORM_SECTIONS.RESPONSIBILITIES]: false,
    [FORM_SECTIONS.PERMISSIONS]: false,
    [FORM_SECTIONS.ROUTINE_TASKS]: false,
    [FORM_SECTIONS.DEPARTMENT_INFO]: false
  });
  const [formTouched, setFormTouched] = useState(false);

  const hookResult = useJobTitleForm();

  // Extract values from hook result based on its structure
  const register = hookResult.register || (hookResult.formMethods && hookResult.formMethods.register);
  const handleSubmit = hookResult.handleSubmit || (hookResult.formMethods && hookResult.formMethods.handleSubmit);
  const errors = hookResult.errors || (hookResult.formMethods && hookResult.formMethods.errors);
  const reset = hookResult.reset || (hookResult.formMethods && hookResult.formMethods.reset);
  const getValues = hookResult.getValues || (hookResult.formMethods && hookResult.formMethods.getValues);
  const setValue = hookResult.setValue || (hookResult.formMethods && hookResult.formMethods.setValue);
  const errorJobTitle = hookResult.errorJobTitle;
  const isErrorJobTitle = hookResult.isErrorJobTitle;
  const isPendingJobTitle = hookResult.isPendingJobTitle;

  // Fetch job title data from API endpoint if in edit mode
  const { data: jobTitleData, isLoading: isLoadingJobTitle } = useCustomQuery({
    queryKey: ["jobTitle", jobTitleId],
    url: jobTitleId ? `/job-titles/find/${jobTitleId}` : null,
    enabled: isEditMode,
  });

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

  // Mutation for create/update operations
  const { mutate: mutateJobTitle } = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // Handle both create and update operations
      const url = isEditMode ? `/job-titles/update/${jobTitleId}` : '/job-titles';
      const response = await apiClient.post(url, data);
      return response.data;
    },
    onSuccess: () => {
      // Show success message
      setSnackbarConfig({
        open: true,
        message: isEditMode ? t("Job title updated successfully") : t("Job title created successfully"),
        severity: "success",
      });
    },
    onError: (error) => {
      console.error("Error:", error);
      setSnackbarConfig({
        open: true,
        message: isEditMode ? t("Failed to update job title") : t("Failed to create job title"),
        severity: "error",
      });
    }
  });

  useEffect(() => {
    if (jobTitleData) {
      console.log("job title data : ", jobTitleData);
      console.log("routine tasks data: ", jobTitleData.routineTasks);

      reset(jobTitleData);
      setResponsibilities(jobTitleData.responsibilities || []);
      setValue("department_id", jobTitleData.department._id || jobTitleData.department.id);
      setValue("category", jobTitleData.category.id);
      setSelectedCategory(jobTitleData.category.id);
      setSelectedDept(jobTitleData.department._id || jobTitleData.department.id);
      setPermissionsSelected(jobTitleData.permissions || []);
      setSpecificDept(jobTitleData.accessibleDepartments || []);
      setSpecificEmp(jobTitleData.accessibleEmps || []);
      setSpecificJobTitle(jobTitleData.accessibleJobTitles || []);
      setIsManager(jobTitleData.is_manager);
      setPermissionsMode(
        jobTitleData.permissions.length > 0 ? "custom" : "default"
      );
      // Set routine tasks related fields
      setHasRoutineTasks(jobTitleData.hasRoutineTasks || false);
      setAutoGenerateRoutineTasks(jobTitleData.autoGenerateRoutineTasks !== undefined ? jobTitleData.autoGenerateRoutineTasks : true);

      // Ensure routine tasks have all required fields
      const processedTasks = (jobTitleData.routineTasks || []).map(task => ({
        name: task.name || "",
        description: task.description || "",
        priority: task.priority || "medium",
        recurringType: task.recurringType || "weekly",
        intervalDays: task.intervalDays || 7,
        estimatedHours: task.estimatedHours || 1,
        isActive: task.isActive !== undefined ? task.isActive : true,
        instructions: task.instructions || [],
        hasSubTasks: !!task.hasSubTasks,
        subTasks: (task.subTasks || []).map(subtask => ({
          name: subtask.name || "",
          description: subtask.description || "",
          estimatedHours: subtask.estimatedHours || 0
        })),
        // Preserve any existing IDs
        id: task.id || undefined
      }));

      console.log("Processed routine tasks: ", processedTasks);
      setRoutineTasks(processedTasks);

      // If we have routine tasks, expand that section automatically
      if (processedTasks.length > 0) {
        toggleSection(FORM_SECTIONS.ROUTINE_TASKS);
      }
    } else {
      reset();
      setResponsibilities([]);
      setRoutineTasks([]);
      setHasRoutineTasks(false);
      setAutoGenerateRoutineTasks(true);
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

      // Open sections with errors automatically
      if (errors.title || errors.description) {
        toggleSection(FORM_SECTIONS.BASIC_INFO, true);
      }
      if (errors.responsibilities) {
        toggleSection(FORM_SECTIONS.RESPONSIBILITIES, true);
      }
      if (errors.permissions) {
        toggleSection(FORM_SECTIONS.PERMISSIONS, true);
      }
      if (errors.routineTasks) {
        toggleSection(FORM_SECTIONS.ROUTINE_TASKS, true);
      }
      if (errors.department_id || errors.category) {
        toggleSection(FORM_SECTIONS.DEPARTMENT_INFO, true);
      }
    }
  }, [errors, setSnackbarConfig]);

  // Effect to update form progress when key form elements change
  useEffect(() => {
    if (formTouched) {
      // Removed progress calculation
    }
  }, [
    responsibilities,
    permissionsSelected,
    routineTasks,
    hasRoutineTasks,
    selectedCategory,
    selectedDept,
    formTouched
  ]);

  // Toggle section expansion
  const toggleSection = (section, forceOpen = null) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: forceOpen !== null ? forceOpen : !prev[section]
    }));
    setActiveSection(section);
    setFormTouched(true);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    const formData = {
      ...getValues(),
      permissions: permissionsSelected,
      is_manager: isManager,
      accessibleDepartments: specificDept,
      accessibleEmps: specificEmp,
      accessibleJobTitles: specificJobTitle,
      responsibilities: getValues("responsibilities"),
      routineTasks,
      hasRoutineTasks,
      autoGenerateRoutineTasks,
    };

    // If we're editing an existing job title, include the ID
    if (isEditMode && jobTitleId) {
      formData.id = jobTitleId;
    }

    console.log("Submitting form data:", formData);
    mutateJobTitle(formData);
  };

  if (!register || !handleSubmit) {
    return <div className="text-center text-red-500 p-4">Error loading form functionality</div>;
  }

  // Section indicator component
  const SectionIndicator = ({ hasError, isComplete }) => (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 
      ${hasError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-gray-500'}`}>
      {hasError ? (
        <AlertTriangle size={14} className="text-white" />
      ) : isComplete ? (
        <Save size={14} className="text-white" />
      ) : (
        <span className="text-white text-xs font-bold">{Object.values(FORM_SECTIONS).indexOf(activeSection) + 1}</span>
      )}
    </div>
  );

  return (
    <GridContainer>
      <div className="bg-droppable-fade p-5 md:p-8 rounded-xl shadow-lg col-span-12 w-full text-twhite">
        <h1 className="text-center text-2xl font-bold mb-6">
          {isEditMode ? t("Update Job Title") : t("Create Job Title")}
        </h1>

        {isLoadingJobTitle && isEditMode ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-t-2 border-b-2 border-secondary rounded-full animate-spin"></div>
            <span className="ml-3">{t("Loading job title data...")}</span>
          </div>
        ) : (
          <form
            className="space-y-8"
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            {/* Basic Info Section */}
            <div
              id={FORM_SECTIONS.BASIC_INFO}
              className={`rounded-xl border ${isLightMode ? 'border-gray-600' : 'border-gray-700'} overflow-hidden transition-all duration-300`}
            >
              <div
                className={`p-4 cursor-pointer flex justify-between items-center bg-dark`}
                onClick={() => toggleSection(FORM_SECTIONS.BASIC_INFO)}
              >
                <div className="flex items-center">
                  <SectionIndicator
                    hasError={errors.title || errors.description}
                    isComplete={getValues("title") && getValues("description")}
                  />
                  <h2 className="text-lg font-semibold">{t("Basic Information")}</h2>
                </div>
                {expandedSections[FORM_SECTIONS.BASIC_INFO] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections[FORM_SECTIONS.BASIC_INFO] && (
                <div className="p-4 space-y-4 bg-secondary/30">
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
                </div>
              )}
            </div>

            {/* Responsibilities Section */}
            <div
              id={FORM_SECTIONS.RESPONSIBILITIES}
              className={`rounded-xl border ${isLightMode ? 'border-gray-600' : 'border-gray-700'} overflow-hidden transition-all duration-300`}
            >
              <div
                className={`p-4 cursor-pointer flex justify-between items-center bg-dark`}
                onClick={() => toggleSection(FORM_SECTIONS.RESPONSIBILITIES)}
              >
                <div className="flex items-center">
                  <SectionIndicator
                    hasError={errors.responsibilities}
                    isComplete={responsibilities.length > 0}
                  />
                  <h2 className="text-lg font-semibold">{t("Responsibilities")}</h2>
                </div>
                {expandedSections[FORM_SECTIONS.RESPONSIBILITIES] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections[FORM_SECTIONS.RESPONSIBILITIES] && (
                <div className="p-4 space-y-4 bg-secondary/30">
                  <DynamicResponsibilities
                    responsibilities={responsibilities}
                    setResponsibilities={setResponsibilities}
                    register={register}
                    setValue={setValue}
                    errors={errors}
                  />
                </div>
              )}
            </div>

            {/* Permissions Section */}
            <div
              id={FORM_SECTIONS.PERMISSIONS}
              className={`rounded-xl border ${isLightMode ? 'border-gray-600' : 'border-gray-700'} overflow-hidden transition-all duration-300`}
            >
              <div
                className={`p-4 cursor-pointer flex justify-between items-center bg-dark`}
                onClick={() => toggleSection(FORM_SECTIONS.PERMISSIONS)}
              >
                <div className="flex items-center">
                  <SectionIndicator
                    hasError={false}
                    isComplete={permissionsMode === "custom" ? permissionsSelected.length > 0 : true}
                  />
                  <h2 className="text-lg font-semibold">{t("Permissions")}</h2>
                </div>
                {expandedSections[FORM_SECTIONS.PERMISSIONS] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections[FORM_SECTIONS.PERMISSIONS] && (
                <div className="p-4 space-y-4 bg-secondary/30">
                  <PermissionsSection
                    permissionsMode={permissionsMode}
                    setPermissionsMode={setPermissionsMode}
                    permissionsSelected={permissionsSelected}
                    setPermissionsSelected={setPermissionsSelected}
                  />

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
                </div>
              )}
            </div>

            {/* Routine Tasks Section */}
            <div
              id={FORM_SECTIONS.ROUTINE_TASKS}
              className={`rounded-xl border ${isLightMode ? 'border-gray-600' : 'border-gray-700'} overflow-hidden transition-all duration-300`}
            >
              <div
                className={`p-4 cursor-pointer flex justify-between items-center bg-dark`}
                onClick={() => toggleSection(FORM_SECTIONS.ROUTINE_TASKS)}
              >
                <div className="flex items-center">
                  <SectionIndicator
                    hasError={errors.routineTasks}
                    isComplete={hasRoutineTasks ? routineTasks.length > 0 : true}
                  />
                  <h2 className="text-lg font-semibold">{t("Routine Tasks")}</h2>
                  {routineTasks.length > 0 && (
                    <span className="ml-2 bg-secondary text-xs text-white px-2 py-0.5 rounded-full">
                      {routineTasks.length}
                    </span>
                  )}
                </div>
                {expandedSections[FORM_SECTIONS.ROUTINE_TASKS] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections[FORM_SECTIONS.ROUTINE_TASKS] && (
                <div className="p-4 space-y-4 bg-secondary/30">
                  {/* Toggle Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-dark/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasRoutineTasks"
                        checked={hasRoutineTasks}
                        onChange={(e) => setHasRoutineTasks(e.target.checked)}
                        className="mr-2 h-5 w-5 rounded text-secondary focus:ring-secondary focus:ring-opacity-50"
                      />
                      <label htmlFor="hasRoutineTasks" className="text-base font-medium">
                        {t("Job Title Has Routine Tasks")}
                      </label>
                    </div>

                    {hasRoutineTasks && (
                      <div className="flex items-center ml-0 sm:ml-8">
                        <input
                          type="checkbox"
                          id="autoGenerateRoutineTasks"
                          checked={autoGenerateRoutineTasks}
                          onChange={(e) => setAutoGenerateRoutineTasks(e.target.checked)}
                          className="mr-2 h-5 w-5 rounded text-secondary focus:ring-secondary focus:ring-opacity-50"
                        />
                        <label htmlFor="autoGenerateRoutineTasks" className="text-base font-medium">
                          {t("Auto-generate for New Employees")}
                        </label>
                      </div>
                    )}
                  </div>

                  {hasRoutineTasks && (
                    <>
                      {/* Task Management Controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                          <h3 className="font-medium text-lg mb-1">{t("Routine Tasks")}</h3>
                          <p className="text-sm text-gray-400">{t("Define regular tasks that employees with this job title are expected to perform")}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRoutineTasks([
                              ...routineTasks,
                              {
                                name: "",
                                description: "",
                                priority: "medium",
                                recurringType: "weekly",
                                intervalDays: 7,
                                estimatedHours: 1,
                                isActive: true,
                                instructions: [],
                                hasSubTasks: false,
                                subTasks: []
                              }
                            ]);
                          }}
                          className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-4 py-2 rounded-lg text-white whitespace-nowrap"
                        >
                          <Plus size={16} />
                          {t("Add New Task")}
                        </button>
                      </div>

                      {/* Task List */}
                      {routineTasks.length === 0 ? (
                        <div className="text-center py-12 bg-dark/30 rounded-lg border border-dashed border-gray-700 mb-4">
                          <div className="bg-dark/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-gray-500" />
                          </div>
                          <p className="text-gray-300 font-medium">{t("No routine tasks added yet")}</p>
                          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">{t("Routine tasks help define clear expectations for this role and can be automatically assigned to new employees")}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setRoutineTasks([
                                ...routineTasks,
                                {
                                  name: "",
                                  description: "",
                                  priority: "medium",
                                  recurringType: "weekly",
                                  intervalDays: 7,
                                  estimatedHours: 1,
                                  isActive: true,
                                  instructions: [],
                                  hasSubTasks: false,
                                  subTasks: []
                                }
                              ]);
                            }}
                            className="mt-4 flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-4 py-2 rounded-lg text-white mx-auto"
                          >
                            <Plus size={16} />
                            {t("Add First Task")}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {routineTasks.map((task, index) => (
                            <div key={index} className="bg-dark rounded-lg overflow-hidden border border-gray-700 transition-all duration-200 hover:border-gray-600">
                              {/* Task Header */}
                              <div className="p-4 bg-dark flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-10 rounded-sm ${task.priority === 'high' ? 'bg-red-500' :
                                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                  <div className="flex-grow">
                                    <h3 className="font-medium text-base">
                                      {task.name || t("Untitled Task")}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                      <span className="flex items-center text-sm text-gray-400">
                                        <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                                        {task.recurringType === 'daily' ? t('Daily') :
                                          task.recurringType === 'weekly' ? t('Weekly') :
                                            task.recurringType === 'monthly' ? t('Monthly') :
                                              `${task.intervalDays} ${t('days')}`}
                                      </span>
                                      <span className="flex items-center text-sm text-gray-400">
                                        <Clock size={14} className="mr-1.5 flex-shrink-0" />
                                        {task.estimatedHours} {task.estimatedHours === 1 ? t('hour') : t('hours')}
                                      </span>
                                      {task.hasSubTasks && task.subTasks && task.subTasks.length > 0 && (
                                        <span className="flex items-center text-sm text-gray-400">
                                          <Bookmark size={14} className="mr-1.5 flex-shrink-0" />
                                          {task.subTasks.length} {task.subTasks.length === 1 ? t('subtask') : t('subtasks')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Toggle expanded state
                                      const updatedTasks = [...routineTasks];
                                      updatedTasks[index].isExpanded = !updatedTasks[index].isExpanded;
                                      setRoutineTasks(updatedTasks);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                    title={task.isExpanded ? t("Collapse") : t("Expand")}
                                  >
                                    {task.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(t("Are you sure you want to delete this task?"))) {
                                        const updatedTasks = routineTasks.filter((_, i) => i !== index);
                                        setRoutineTasks(updatedTasks);
                                      }
                                    }}
                                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors"
                                    title={t("Delete")}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Task Details */}
                              {task.isExpanded && (
                                <div className="p-4 border-t border-gray-700 space-y-5 bg-dark/50">
                                  <div className="grid grid-cols-1 gap-5">
                                    {/* Task Name and Description */}
                                    <div>
                                      <label className="block text-sm font-medium mb-1.5">{t("Task Name")}</label>
                                      <input
                                        type="text"
                                        value={task.name}
                                        onChange={(e) => {
                                          const updatedTasks = [...routineTasks];
                                          updatedTasks[index].name = e.target.value;
                                          setRoutineTasks(updatedTasks);
                                        }}
                                        className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        placeholder={t("Enter task name")}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium mb-1.5">{t("Description")}</label>
                                      <textarea
                                        value={task.description}
                                        onChange={(e) => {
                                          const updatedTasks = [...routineTasks];
                                          updatedTasks[index].description = e.target.value;
                                          setRoutineTasks(updatedTasks);
                                        }}
                                        className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 min-h-[80px] focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        placeholder={t("Enter task description")}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Priority */}
                                    <div>
                                      <label className="block text-sm font-medium mb-1.5">{t("Priority")}</label>
                                      <div className="relative">
                                        <select
                                          value={task.priority}
                                          onChange={(e) => {
                                            const updatedTasks = [...routineTasks];
                                            updatedTasks[index].priority = e.target.value;
                                            setRoutineTasks(updatedTasks);
                                          }}
                                          className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 appearance-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        >
                                          <option value="low">{t("Low")}</option>
                                          <option value="medium">{t("Medium")}</option>
                                          <option value="high">{t("High")}</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                          <ChevronDown size={16} className="text-gray-400" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Recurring Type */}
                                    <div>
                                      <label className="block text-sm font-medium mb-1.5">{t("Recurrence")}</label>
                                      <div className="relative">
                                        <select
                                          value={task.recurringType}
                                          onChange={(e) => {
                                            const updatedTasks = [...routineTasks];
                                            updatedTasks[index].recurringType = e.target.value;

                                            // Set default interval days based on recurring type
                                            if (e.target.value === 'daily') {
                                              updatedTasks[index].intervalDays = 1;
                                            } else if (e.target.value === 'weekly') {
                                              updatedTasks[index].intervalDays = 7;
                                            } else if (e.target.value === 'monthly') {
                                              updatedTasks[index].intervalDays = 30;
                                            }

                                            setRoutineTasks(updatedTasks);
                                          }}
                                          className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 appearance-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        >
                                          <option value="daily">{t("Daily")}</option>
                                          <option value="weekly">{t("Weekly")}</option>
                                          <option value="monthly">{t("Monthly")}</option>
                                          <option value="custom">{t("Custom")}</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                          <ChevronDown size={16} className="text-gray-400" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Interval Days (show only if custom) */}
                                    {task.recurringType === 'custom' ? (
                                      <div>
                                        <label className="block text-sm font-medium mb-1.5">{t("Days Between")}</label>
                                        <input
                                          type="number"
                                          value={task.intervalDays}
                                          onChange={(e) => {
                                            const updatedTasks = [...routineTasks];
                                            updatedTasks[index].intervalDays = Number(e.target.value);
                                            setRoutineTasks(updatedTasks);
                                          }}
                                          min="1"
                                          className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="block text-sm font-medium mb-1.5">{t("Estimated Hours")}</label>
                                        <input
                                          type="number"
                                          value={task.estimatedHours}
                                          onChange={(e) => {
                                            const updatedTasks = [...routineTasks];
                                            updatedTasks[index].estimatedHours = Number(e.target.value);
                                            setRoutineTasks(updatedTasks);
                                          }}
                                          min="0.5"
                                          step="0.5"
                                          className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Has Subtasks Toggle */}
                                  <div className="pt-2">
                                    <div className="flex items-center mb-3">
                                      <input
                                        type="checkbox"
                                        id={`hasSubTasks-${index}`}
                                        checked={task.hasSubTasks}
                                        onChange={(e) => {
                                          const updatedTasks = [...routineTasks];
                                          updatedTasks[index].hasSubTasks = e.target.checked;
                                          if (!e.target.checked) {
                                            updatedTasks[index].subTasks = [];
                                          }
                                          setRoutineTasks(updatedTasks);
                                        }}
                                        className="mr-2 h-5 w-5 rounded text-secondary focus:ring-secondary focus:ring-opacity-50"
                                      />
                                      <label htmlFor={`hasSubTasks-${index}`} className="text-base font-medium">
                                        {t("Task has subtasks")}
                                      </label>
                                    </div>
                                  </div>

                                  {/* Subtasks */}
                                  {task.hasSubTasks && (
                                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                                      <div className="flex justify-between items-center">
                                        <h4 className="font-medium">{t("Subtasks")}</h4>
                                        <span className="text-sm text-gray-400">
                                          {task.subTasks?.length || 0} {(task.subTasks?.length || 0) === 1 ? t('subtask') : t('subtasks')}
                                        </span>
                                      </div>

                                      {task.subTasks && task.subTasks.map((subtask, subIndex) => (
                                        <div key={subIndex} className="bg-dark p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                                          <div className="flex justify-between items-start mb-3">
                                            <input
                                              type="text"
                                              value={subtask.name}
                                              onChange={(e) => {
                                                const updatedTasks = [...routineTasks];
                                                updatedTasks[index].subTasks[subIndex].name = e.target.value;
                                                setRoutineTasks(updatedTasks);
                                              }}
                                              className="flex-grow bg-dark border border-gray-700 rounded-lg px-3 py-2 mr-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                                              placeholder={t("Subtask name")}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedTasks = [...routineTasks];
                                                updatedTasks[index].subTasks = updatedTasks[index].subTasks.filter(
                                                  (_, i) => i !== subIndex
                                                );
                                                setRoutineTasks(updatedTasks);
                                              }}
                                              className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-xs text-gray-400 mb-1">{t("Description")}</label>
                                              <input
                                                type="text"
                                                value={subtask.description}
                                                onChange={(e) => {
                                                  const updatedTasks = [...routineTasks];
                                                  updatedTasks[index].subTasks[subIndex].description = e.target.value;
                                                  setRoutineTasks(updatedTasks);
                                                }}
                                                className="bg-dark border border-gray-700 rounded-lg px-3 py-2 w-full focus:border-secondary focus:ring-1 focus:ring-secondary"
                                                placeholder={t("Brief description")}
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-gray-400 mb-1">{t("Estimated Hours")}</label>
                                              <div className="flex items-center">
                                                <input
                                                  type="number"
                                                  value={subtask.estimatedHours}
                                                  onChange={(e) => {
                                                    const updatedTasks = [...routineTasks];
                                                    updatedTasks[index].subTasks[subIndex].estimatedHours = Number(e.target.value);
                                                    setRoutineTasks(updatedTasks);
                                                  }}
                                                  min="0.5"
                                                  step="0.5"
                                                  className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                                                  placeholder={t("Hours")}
                                                />
                                                <span className="ml-2 text-sm text-gray-400">{t("hrs")}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedTasks = [...routineTasks];
                                          if (!updatedTasks[index].subTasks) {
                                            updatedTasks[index].subTasks = [];
                                          }
                                          updatedTasks[index].subTasks.push({
                                            name: "",
                                            description: "",
                                            estimatedHours: 0.5
                                          });
                                          setRoutineTasks(updatedTasks);
                                        }}
                                        className="flex items-center gap-1.5 text-sm text-secondary hover:text-secondary/80 transition-colors bg-dark/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600"
                                      >
                                        <Plus size={14} />
                                        {t("Add Subtask")}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Department Info Section */}
            <div
              id={FORM_SECTIONS.DEPARTMENT_INFO}
              className={`rounded-xl border ${isLightMode ? 'border-gray-600' : 'border-gray-700'} overflow-hidden transition-all duration-300`}
            >
              <div
                className={`p-4 cursor-pointer flex justify-between items-center bg-dark`}
                onClick={() => toggleSection(FORM_SECTIONS.DEPARTMENT_INFO)}
              >
                <div className="flex items-center">
                  <SectionIndicator
                    hasError={errors.department_id || errors.category}
                    isComplete={selectedDept && selectedCategory}
                  />
                  <h2 className="text-lg font-semibold">{t("Department & Category")}</h2>
                </div>
                {expandedSections[FORM_SECTIONS.DEPARTMENT_INFO] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections[FORM_SECTIONS.DEPARTMENT_INFO] && (
                <div className="p-4 space-y-4 bg-secondary/30">
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

                  <IsManagerToggle isManager={isManager} setIsManager={setIsManager} />

                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                className={`w-full py-3 mt-4 bg-secondary hover:bg-secondary/80 
                  text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2
                  ${isPendingJobTitle ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isPendingJobTitle}
              >
                {!isPendingJobTitle ? (
                  <>
                    <Save size={18} />
                    {isEditMode ? t("Update Job Title") : t("Create Job Title")}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    {isEditMode ? t("Updating...") : t("Creating...")}
                  </div>
                )}
              </button>
            </div>

            {isErrorJobTitle && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mt-4">
                <p className="text-red-500 text-center flex items-center justify-center gap-2">
                  <AlertTriangle size={18} />
                  {errorJobTitle + ""}
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </GridContainer>
  );
};

export default AddJobTitle;
