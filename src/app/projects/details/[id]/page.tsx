"use client";

import ProjectDetailsHierarchyTree from "@/components/common/atoms/ProjectDetailsHierarchyTree";
import TaskStatusPieChart from "@/components/common/atoms/tasks/TaskStatusPieChart";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import HomeTasksReport from "@/components/common/molcules/HomeTasksReport";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate } from "@/services/task.service";
import { ProjectDetailsType } from "@/types/Project.type";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ProjectDetails = ({ params: { id } }: { params: { id: string } }) => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    tasks: true,
    structure: true
  });

  // Toggle section visibility
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { data: project, isLoading } = useCustomQuery<ProjectDetailsType>({
    queryKey: ["project-details"],
    url: `/projects/project-details/${id}`,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 text-twhite">
        {t("No Project Details")}
      </div>
    );
  }

  // Calculate project completion percentage
  const totalTasks = project.taskDone + project.taskOnGoing + project.taskOnTest + project.taskPending;
  const completionPercentage = totalTasks > 0
    ? Math.round((project.taskDone / totalTasks) * 100)
    : 0;

  // Determine status colors
  const getStatusColor = () => {
    if (project.is_over_due) return "bg-danger/20 text-danger border-danger/50";
    if (completionPercentage === 100) return "bg-success/20 text-success border-success/50";
    if (completionPercentage > 75) return "bg-success/20 text-success border-success/50";
    if (completionPercentage > 50) return "bg-primary/20 text-primary border-primary/50";
    if (completionPercentage > 25) return "bg-warning/20 text-warning border-warning/50";
    return "bg-warning/20 text-warning border-warning/50";
  };

  return (
    <GridContainer>
      <div className="col-span-full px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-secondary hover:bg-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-twhite" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-twhite">
                {project.name}
              </h1>
              <p className="text-tdark text-sm md:text-base">
                {t("ID")}: {project._id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor()}`}>
              {project.is_over_due ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  {t("Overdue")}
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  {completionPercentage}% {t("Complete")}
                </>
              )}
            </div>

            <div className="px-4 py-2 rounded-full bg-secondary text-twhite border border-gray-700 text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(project.startDate, currentLanguage as "ar" | "en")} - {formatDate(project.endDate, currentLanguage as "ar" | "en")}
            </div>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mb-8 overflow-hidden bg-gradient-to-br from-dark to-secondary rounded-xl shadow-lg border border-gray-700/50">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('info')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-twhite">{t("Project Information")}</h2>
            </div>
            {expandedSections.info ? (
              <ChevronUp className="w-5 h-5 text-twhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-twhite" />
            )}
          </div>

          {expandedSections.info && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Details Card */}
                <div className="bg-dark p-5 rounded-xl border border-gray-700/50 shadow-md">
                  <h3 className="text-lg font-semibold text-twhite mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    {t("Details")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark">{t("Description")}</span>
                      <p className="text-twhite">{project.description || t("No description provided")}</p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark">{t("Department Count")}</span>
                      <p className="text-twhite">{project.departments?.length || 0}</p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark">{t("Task Count")}</span>
                      <p className="text-twhite">{totalTasks}</p>
                    </div>
                  </div>
                </div>

                {/* Status Overview Card */}
                <div className="bg-dark p-5 rounded-xl border border-gray-700/50 shadow-md">
                  <h3 className="text-lg font-semibold text-twhite mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-warning" />
                    {t("Status")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-tdark">{t("Pending")}</span>
                      <span className="text-twhite font-medium">{project.taskPending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-tdark">{t("On Going")}</span>
                      <span className="text-twhite font-medium">{project.taskOnGoing}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-tdark">{t("On Test")}</span>
                      <span className="text-twhite font-medium">{project.taskOnTest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-tdark">{t("Done")}</span>
                      <span className="text-twhite font-medium">{project.taskDone}</span>
                    </div>
                  </div>
                </div>

                {/* Pie Chart Card */}
                <div className="bg-dark p-5 rounded-xl border border-gray-700/50 shadow-md">
                  <h3 className="text-lg font-semibold text-twhite mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-success" />
                    {t("Task Distribution")}
                  </h3>
                  <div className="w-full h-48">
                    <TaskStatusPieChart
                      taskDone={project.taskDone}
                      taskOnGoing={project.taskOnGoing}
                      taskOnTest={project.taskOnTest}
                      taskPending={project.taskPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="mb-8 overflow-hidden bg-gradient-to-br from-dark to-secondary rounded-xl shadow-lg border border-gray-700/50">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('tasks')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-xl font-bold text-twhite">{t("Project Tasks")}</h2>
            </div>
            {expandedSections.tasks ? (
              <ChevronUp className="w-5 h-5 text-twhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-twhite" />
            )}
          </div>

          {expandedSections.tasks && (
            <div className="p-4">
              <HomeTasksReport
                tasksData={project.projectTasks}
                isCentered={false}
              />
            </div>
          )}
        </div>

        {/* Hierarchy Tree Section */}
        <div className="mb-8 overflow-hidden bg-gradient-to-br from-dark to-secondary rounded-xl shadow-lg border border-gray-700/50">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('structure')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Users className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-xl font-bold text-twhite">{t("Project Structure")}</h2>
            </div>
            {expandedSections.structure ? (
              <ChevronUp className="w-5 h-5 text-twhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-twhite" />
            )}
          </div>

          {expandedSections.structure && (
            <div className="p-4">
              <div className="w-full h-[600px] overflow-hidden">
                <ProjectDetailsHierarchyTree
                  data={project.departments}
                  width="100%"
                  onPress={(deptId) => {
                    router.push(
                      `/projects/details/project-tasks/${project._id}/${deptId}`
                    );
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </GridContainer>
  );
};

export default ProjectDetails;
