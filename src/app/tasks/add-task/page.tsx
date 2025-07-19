"use client";

import CollapsibleCard from "@/components/common/atoms/CollapsibleCard";
import FileUploadSection from "@/components/common/atoms/tasks/FileUploadSection";
import BasicInformationSection from "@/components/common/atoms/tasks/BasicInformationSection";
import AssignmentSection from "@/components/common/atoms/tasks/AssignmentSection";
import DatesTimelineSection from "@/components/common/atoms/tasks/DatesTimelineSection";
import RecurringRoutineSection from "@/components/common/atoms/tasks/RecurringRoutineSection";
import TaskPageHeader from "@/components/common/atoms/tasks/TaskPageHeader";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { useTaskFormState } from "@/hooks/tasks/useTaskFormState";
import { useTaskQueries } from "@/hooks/tasks/useTaskQueries";
import { useTaskSubmit } from "@/hooks/tasks/useTaskSubmit";
import useCustomQuery from "@/hooks/useCustomQuery";
import { ReceiveTaskType, TaskFormInputs } from "@/types/Task.type";
import { TaskTree } from "@/types/trees/Task.tree.type";
import { useMemo, useState } from "react";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";
import { FileText, Users, Calendar, RotateCcw, Paperclip } from "lucide-react";

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



