"use client";

import CollapsibleCard from "@/components/common/atoms/CollapsibleCard";
import FileUploadSection from "@/components/common/atoms/tasks/FileUploadSection";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { useTaskFormState } from "@/hooks/tasks/useTaskFormState";
import { useTaskQueries } from "@/hooks/tasks/useTaskQueries";
import { useTaskSubmit } from "@/hooks/tasks/useTaskSubmit";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import { EmployeeType } from "@/types/EmployeeType.type";
import { ProjectType } from "@/types/Project.type";
import { ReceiveTaskType, TaskFormInputs } from "@/types/Task.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { TaskTree } from "@/types/trees/Task.tree.type";
import { apiClient } from "@/utils/axios/usage";
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, Building2, Calendar, Clock, FileText, FolderOpen, GitBranch, Layers, Loader2, Paperclip, Plus, Repeat, RotateCcw, Type, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";

// Define interfaces for API responses
interface SectionType {
  _id: string;
  name: string;
}


const AddTaskPage: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    basic: true,
    assignment: true,
    dates: false,
    time: false,
    recurring: false,
    attachments: false,
  });


  const {
    formMethods: { register, handleSubmit, errors, watch, setValue, reset },
    t,
    router,
  } = useTaskForm();

  // Watch form values for conditional logic
  const selectedEmployee = watch("emp");
  const selectedDepartment = watch("department_id");
  const selectedProject = watch("project_id");
  const isRecurring = watch("isRecurring");

  // Form state management
  const { isEmployeeDisabled, isDepartmentDisabled, isProjectDisabled } =
    useTaskFormState(selectedEmployee, selectedDepartment, selectedProject);

  // Data queries
  const { projects, departments, employees } = useTaskQueries(
    selectedProject,
    isProjectDisabled
  );

  // Get selected project data for date constraints
  const selectedProjectData = useMemo(() => {
    if (!selectedProject || !projects) return null;
    return projects.find(project => project._id === selectedProject);
  }, [selectedProject, projects]);

  // Calculate date constraints
  const dateConstraints = useMemo(() => {
    if (!selectedProjectData) return { min: undefined, max: undefined };

    return {
      min: selectedProjectData.startDate ? selectedProjectData.startDate.split('T')[0] : undefined,
      max: selectedProjectData.endDate ? selectedProjectData.endDate.split('T')[0] : undefined
    };
  }, [selectedProjectData]);




  const { data: sectionsResponse } = useCustomQuery<SectionType[]>({
    url: "/sections",
    queryKey: ["sections"],
  })


  const { data: tasksResponse } = useCustomQuery<{
    info: ReceiveTaskType[];
    tree: TaskTree[];
  }>({
    url: "/tasks/tree",
    queryKey: ["tasks"],
  })


  const sections = sectionsResponse || [];
  const tasks = tasksResponse?.tree || [];

  // Form submission
  const { addTask, isPending } = useTaskSubmit(
    selectedEmployee,
    selectedDepartment,
    isProjectDisabled,
    reset
  );

  const onSubmit = (data: TaskFormInputs) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== "")
    );

    addTask(filteredData);
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showFiles = useTasksGuard(["enableFiles"]);
  const showRecurring = useTasksGuard(["enableRecurring"]);

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <TaskPageHeader
        t={t}
        onCancel={handleCancel}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isPending}
      />

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Basic Information */}
          <CollapsibleCard
            title={t("Basic Information")}
            icon={<FileText className="w-5 h-5" />}
            iconBgColor="bg-purple-600/20"
            iconTextColor="text-purple-400"
            isOpen={openSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <BasicInformationSection
              register={register}
              errors={errors}
              t={t}
            />
          </CollapsibleCard>

          {/* Assignment & Organization */}
          <CollapsibleCard
            title={t("Assignment & Organization")}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="bg-blue-600/20"
            iconTextColor="text-blue-400"
            isOpen={openSections.assignment}
            onToggle={() => toggleSection('assignment')}
          >
            <AssignmentSection
              register={register}
              t={t}
              employees={employees}
              departments={departments}
              projects={projects}
              sections={sections}
              tasks={tasks}
              isEmployeeDisabled={isEmployeeDisabled}
              isDepartmentDisabled={isDepartmentDisabled}
              isProjectDisabled={isProjectDisabled}
            />
          </CollapsibleCard>

          <CollapsibleCard
            title={t("Dates & Timeline")}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-green-600/20"
            iconTextColor="text-green-400"
            isOpen={openSections.dates}
            onToggle={() => toggleSection('dates')}
          >
            <DatesTimelineSection
              register={register}
              errors={errors}
              t={t}
              dateConstraints={dateConstraints}
              selectedProjectData={selectedProjectData}
              watch={watch}
              setValue={setValue}
            />
          </CollapsibleCard>

          {/* Recurring & Routine Settings */}
          <CollapsibleCard
            title={t("Recurring & Routine Settings")}
            icon={<RotateCcw className="w-5 h-5" />}
            iconBgColor="bg-indigo-600/20"
            iconTextColor="text-indigo-400"
            isOpen={openSections.recurring}
            onToggle={() => toggleSection('recurring')}
          >
            {showRecurring && (
              <RecurringRoutineSection
                register={register}
                errors={errors}
                t={t}
                isRecurring={isRecurring}
                dateConstraints={dateConstraints}
              />
            )}
          </CollapsibleCard>

          {/* File Attachments */}
          <CollapsibleCard
            title={t("File Attachments")}
            icon={<Paperclip className="w-5 h-5" />}
            iconBgColor="bg-orange-600/20"
            iconTextColor="text-orange-400"
            isOpen={openSections.attachments}
            onToggle={() => toggleSection('attachments')}
          >
            {showFiles && (
              <FileUploadSection
                register={register}
                errors={errors}
                isLightMode={false}
                t={t}
                setValue={setValue}
              />
            )}
          </CollapsibleCard>

        </form>
      </div>
    </div>
  );
};

export default AddTaskPage;
// Update the interface
interface RecurringRoutineSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  t: (key: string) => string;
  isRecurring: boolean | undefined;
  dateConstraints?: { min: string | undefined; max: string | undefined };
}
const RecurringRoutineSection: React.FC<RecurringRoutineSectionProps> = ({
  register,
  errors,
  t,
  isRecurring,
  dateConstraints
}) => {
  const recurringEndDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="space-y-6">
      {/* Is Recurring */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg border border-purple-500/20">
          <input
            {...register("isRecurring")}
            type="checkbox"
            id="isRecurring"
            className="w-5 h-5 text-purple-600 bg-dark border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="isRecurring" className="text-twhite font-medium flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            {t("Recurring Task")}
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-dark to-gray-800/50 rounded-xl border border-purple-500/30">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                {t("Recurring Type")} {isRecurring && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <select
                  {...register("recurringType")}
                  className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
                >

                  <option value="">{t("Select Type")}</option>
                  <option value="daily">{t("Daily")}</option>
                  <option value="weekly">{t("Weekly")}</option>
                  <option value="monthly">{t("Monthly")}</option>
                  <option value="yearly">{t("Yearly")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.recurringType && (
                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recurringType.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                {t("Interval (Days)")} {isRecurring && <span className="text-red-400">*</span>}
              </label>
              <input
                {...register("intervalInDays")}
                type="number"
                min="1"
                placeholder={t("Enter interval")}
                className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
              />
              {errors.intervalInDays && (
                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.intervalInDays.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                {t("Recurring End Date")} {isRecurring && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  {...register("recurringEndDate")}
                  ref={e => {
                    register("recurringEndDate").ref(e);
                    recurringEndDateRef.current = e;
                  }}
                  type="date"
                  min={dateConstraints?.min}
                  max={dateConstraints?.max}
                  className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors cursor-pointer"
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => recurringEndDateRef.current?.showPicker?.() || recurringEndDateRef.current?.focus()}
                  style={{ pointerEvents: 'auto' }}
                >
                </div>
              </div>
              {errors.recurringEndDate && (
                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.recurringEndDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                {t("End Date")} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("end_date")}
                  ref={e => {
                    register("end_date").ref(e);
                    endDateRef.current = e;
                  }}
                  type="date"
                  min={dateConstraints?.min}
                  max={dateConstraints?.max}
                  className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors cursor-pointer"
                />

              </div>
              {errors.end_date && (
                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Is Routine Task */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-600/10 to-cyan-600/10 rounded-lg border border-indigo-500/20">
          <input
            {...register("isRoutineTask")}
            type="checkbox"
            id="isRoutineTask"
            className="w-5 h-5 text-indigo-600 bg-dark border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <label htmlFor="isRoutineTask" className="text-twhite font-medium flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-400" />
            {t("Routine Task")}
          </label>
        </div>
      </div>
    </div>
  );
};
interface DatesTimelineSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  t: (key: string) => string;
  dateConstraints: { min: string | undefined; max: string | undefined };
  selectedProjectData: ProjectType | null | undefined;
  watch: ReturnType<typeof useTaskForm>["formMethods"]["watch"];
  setValue: ReturnType<typeof useTaskForm>["formMethods"]["setValue"];
}
const DatesTimelineSection: React.FC<DatesTimelineSectionProps> = ({
  register,
  errors,
  t,
  dateConstraints,
  selectedProjectData,
  watch,
  setValue,
}) => {
  const [isExpectedEndDisabled, setIsExpectedEndDisabled] = useState(false);
  const expectedEndWasSetByUser = useRef(false);
  const [estimatedHours, setEstimatedHours] = useState<number | null>(null);
  const [estimatedWorkingDays, setEstimatedWorkingDays] = useState<number | null>(null);

  const startDate = watch("start_date");
  const dueDate = watch("due_date");

  // Auto-fetch expected end date when both start and due date are set
  useEffect(() => {
    if (startDate && dueDate) {
      setIsExpectedEndDisabled(true);
      apiClient
        .get<{ data: { estimatedHours: number; workingDays: number; startDate: string; endDate: string } }>(
          "/company-settings/calculate-working-days",
          { startDate, endDate: dueDate }
        )
        .then((res) => {
          if (res.data && res.data.endDate) {
            setValue("expected_end_date", res.data.endDate.split("T")[0]);
            setEstimatedHours(res.data.estimatedHours);
            setEstimatedWorkingDays(res.data.workingDays);
            expectedEndWasSetByUser.current = false;
          }
        })
        .catch(() => {
          setIsExpectedEndDisabled(false);
          setEstimatedHours(null);
          setEstimatedWorkingDays(null);
        })
    } else {
      setIsExpectedEndDisabled(false);
      setEstimatedHours(null);
      setEstimatedWorkingDays(null);
      if (!expectedEndWasSetByUser.current) {
        setValue("expected_end_date", "");
      }
    }
  }, [startDate, dueDate, setValue]);

  // Track if user sets expected_end_date manually
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "expected_end_date" && !isExpectedEndDisabled) {
        expectedEndWasSetByUser.current = true;
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isExpectedEndDisabled]);

  const startDateRef = useRef<HTMLInputElement | null>(null);
  const dueDateRef = useRef<HTMLInputElement | null>(null);

  // Enhanced date picker opening function
  const openDatePicker = (inputRef: React.RefObject<HTMLInputElement>) => {
    try {
      if ('showPicker' in (inputRef.current || {})) {
        (inputRef.current as any)?.showPicker();
      } else {
        inputRef.current?.focus();
        inputRef.current?.click();
      }
    } catch (error) {
      console.log(error);
      inputRef.current?.focus();
    }
  };

  const showEstimatedTime = useTasksGuard(["enableEstimatedTime"]);
  const showDueDate = useTasksGuard(["enableDueDate"]);

  return (
    <div className="space-y-4">
      {/* Project Date Info Display */}
      {selectedProjectData && (
        <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
            <FolderOpen className="w-4 h-4" />
            {t("Project Date Constraints")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-3 h-3 text-green-400" />
              <span>{t("Project Start")}: </span>
              <span className="text-green-400 font-medium">
                {selectedProjectData.startDate ? new Date(selectedProjectData.startDate).toLocaleDateString() : t("Not set")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-3 h-3 text-red-400" />
              <span>{t("Project End")}: </span>
              <span className="text-red-400 font-medium">
                {selectedProjectData.endDate ? new Date(selectedProjectData.endDate).toLocaleDateString() : t("Not set")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            {t("Start Date")} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div
              className="relative cursor-pointer"
              onClick={() => openDatePicker(startDateRef)}
            >
              <input
                {...register("start_date")}
                ref={e => {
                  register("start_date").ref(e);
                  startDateRef.current = e;
                }}
                type="date"
                min={dateConstraints.min}
                max={dateConstraints.max}
                className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openDatePicker(startDateRef);
                }}
              />
              {/* Overlay to make entire area clickable */}
              <div className="absolute inset-0 cursor-pointer" />
            </div>
          </div>
          {errors.start_date && (
            <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.start_date.message}
            </p>
          )}
          {dateConstraints.min && (
            <p className="text-green-400 mt-1 text-xs">
              {t("Must be between")} {new Date(dateConstraints.min).toLocaleDateString()} - {dateConstraints.max ? new Date(dateConstraints.max).toLocaleDateString() : t("Project end")}
            </p>
          )}
        </div>

        {/* Due Date */}
        {showDueDate && (
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400" />
              {t("Due Date")} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div
                className="relative cursor-pointer"
                onClick={() => openDatePicker(dueDateRef)}
              >
                <input
                  {...register("due_date")}
                  ref={e => {
                    register("due_date").ref(e);
                    dueDateRef.current = e;
                  }}
                  type="date"
                  min={dateConstraints.min}
                  max={dateConstraints.max}
                  className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-red-500 focus:ring focus:ring-red-500/20 focus:outline-none transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDatePicker(dueDateRef);
                  }}
                />
                {/* Overlay to make entire area clickable */}
                <div className="absolute inset-0 cursor-pointer" />
              </div>
            </div>
            {errors.due_date && (
              <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.due_date.message}
              </p>
            )}
            {dateConstraints.min && (
              <p className="text-red-400 mt-1 text-xs">
                {t("Must be between")} {new Date(dateConstraints.min).toLocaleDateString()} - {dateConstraints.max ? new Date(dateConstraints.max).toLocaleDateString() : t("Project end")}
              </p>
            )}
          </div>
        )}

        {/* Estimated Working Hours and Days */}
        {showEstimatedTime && isExpectedEndDisabled && estimatedHours !== null && (
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 mb-1 block">{t("Estimated Working Hours")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-dark text-twhite border border-gray-700"
                value={Math.round(estimatedHours)}
                readOnly
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 mb-1 block">{t("Estimated Working Days")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-dark text-twhite border border-gray-700"
                value={estimatedWorkingDays !== null ? estimatedWorkingDays : ''}
                readOnly
              />
            </div>
          </div>
        )}

        {/* Progress Calculation Method */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            {t("Progress Calculation")}
          </label>
          <div className="relative">
            <select
              {...register("progressCalculationMethod")}
              className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">
                {t("Select a calculation method")}
              </option>
              <option value="time_based">
                {t("Time Based")}
              </option>
              <option value="date_based">
                {t("Date Based")}
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
interface AssignmentSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  t: (key: string) => string;
  employees?: {
    info: EmployeeType[];
    tree: EmpTree[];
  };
  departments?: {
    info: DepartmentType[];
    tree: DeptTree[];
  };
  projects?: ProjectType[];
  sections?: SectionType[];
  tasks?: TaskTree[];
  isEmployeeDisabled: boolean;
  isDepartmentDisabled: boolean;
  isProjectDisabled: boolean;
}
const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  register,
  t,
  employees,
  departments,
  projects,
  sections,
  tasks,
  isEmployeeDisabled,
  isDepartmentDisabled,
  isProjectDisabled,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-purple-400" />
          {t("Project")}
        </label>
        <div className="relative">
          <select
            {...register("project_id")}
            disabled={isProjectDisabled}
            className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none ${isProjectDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
              }`}
          >
            <option value="">{t("Select Project")}</option>
            {projects?.filter((proj) => proj.status == "IN_PROGRESS").map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Department */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          {t("Department")}
        </label>
        <div className="relative">
          <select
            {...register("department_id")}
            disabled={isDepartmentDisabled}
            className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 focus:outline-none transition-colors appearance-none ${isDepartmentDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
              }`}
          >
            <option value="">{t("Select Department")}</option>
            {departments?.tree?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      {/* Employee Assignment */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          {t("Assign to Employee")}
        </label>
        <div className="relative">
          <select
            {...register("emp")}
            disabled={isEmployeeDisabled}
            className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors appearance-none ${isEmployeeDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
              }`}
          >
            <option value="">{t("Select Employee")}</option>
            {employees?.info?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Section */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-green-400" />
          {t("Section")}
        </label>
        <div className="relative">
          <select
            {...register("section_id")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors appearance-none"
          >
            <option value="">{t("Select Section")}</option>
            {sections?.map((section: SectionType) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Parent Task */}
      <div className="lg:col-span-2">
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-yellow-400" />
          {t("Parent Task")}
        </label>
        <div className="relative">
          <select
            {...register("parent_task")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors appearance-none"
          >
            <option value="">{t("Select Parent Task")}</option>
            {tasks?.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};


interface BasicInformationSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  t: (key: string) => string;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  register,
  errors,
  t,
}) => {
  const showPriority = useTasksGuard(["enablePriority"]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Task Name */}
      <div className="md:col-span-1">
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Type className="w-4 h-4 text-purple-400" />
          {t("Task Name")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("name")}
            type="text"
            placeholder={t("Enter task name")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.name && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.name && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Priority */}
      {showPriority && (
        <div className="md:col-span-1">
          <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            {t("Priority")} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              {...register("priority")}
              className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-orange-500 focus:ring focus:ring-orange-500/20 focus:outline-none transition-colors appearance-none"
            >
              <option value="">{t("Select Priority")}</option>
              <option value="LOW">{t("Low")}</option>
              <option value="MEDIUM">{t("Medium")}</option>
              <option value="HIGH">{t("High")}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {errors.priority && (
            <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.priority.message}
            </p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          {t("Description")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <textarea
            {...register("description")}
            placeholder={t("Enter task description")}
            rows={4}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors resize-none"
          />
          {errors.description && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.description && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.description.message}
          </p>
        )}
      </div>




      {/* Status */}
      {/* <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          {t("Status")}
        </label>
        <div className="relative">
          <select
            {...register("status")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
          >
            <option value="">{t("Select Status")}</option>
            <option value="IN_PROGRESS">{t("In Progress")}</option>
            <option value="COMPLETED">{t("Completed")}</option>
            <option value="CANCELLED">{t("Cancelled")}</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div> */}
    </div>
  );
};




interface TaskPageHeaderProps {
  t: (key: string) => string;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

const TaskPageHeader: React.FC<TaskPageHeaderProps> = ({
  t,
  onCancel,
  onSubmit,
  isPending,
}) => {
  const { getDir } = useLanguage()
  const isRTL = getDir() == "rtl"
  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-dark/50 rounded-lg transition-colors text-gray-400 hover:text-twhite"
            >
              {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-600/20">
                <FileText className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-twhite">{t("Create New Task")}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {t("Fill in the details to create a new task")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSubmit}
              disabled={isPending}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white ${isPending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("Creating...")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t("Create Task")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



