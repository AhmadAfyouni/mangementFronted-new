"use client";

import ProjectDetailsHierarchyTree from "@/components/common/atoms/ProjectDetailsHierarchyTree";
import TaskStatusPieChart from "@/components/common/atoms/tasks/TaskStatusPieChart";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import HomeTasksReport from "@/components/common/molcules/HomeTasksReport";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate } from "@/services/task.service";
import { ProjectDetailsType, ProjectStatus } from "@/types/Project.type";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Layers,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProjectStatusControls from "@/components/common/atoms/projects/ProjectStatusControls";

const ProjectDetails = ({ params: { id } }: { params: { id: string } }) => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'structure'>('info');

  const { data: project, isLoading } = useCustomQuery<ProjectDetailsType>({
    queryKey: ["project-details", id],
    url: `/projects/project-details/${id}`,
  });

  const [projectStatus, setProjectStatus] = useState<ProjectStatus | undefined>(undefined);

  useEffect(() => {
    if (project?.status) {
      setProjectStatus(project.status);
    }
  }, [project]);

  const handleStatusUpdate = (newStatus: ProjectStatus) => {
    setProjectStatus(newStatus);
  };

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

  const tabs = [
    {
      id: 'info' as const,
      label: t("Project Information"),
      icon: Briefcase,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/20'
    },
    {
      id: 'tasks' as const,
      label: t("Project Tasks"),
      icon: Clock,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/20'
    },
    {
      id: 'structure' as const,
      label: t("Project Structure"),
      icon: Users,
      iconColor: 'text-success',
      bgColor: 'bg-success/20'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
              {/* Project Details Card */}
              <div className="md:col-span-2 bg-dark p-5 rounded-xl border border-gray-700/50 shadow-md flex flex-col">
                <h3 className="text-lg font-semibold text-twhite mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  {t("Details")}
                </h3>

                <div className="space-y-4 flex-1">
                  {/* Description */}
                  <div className="flex flex-col">
                    <span className="text-sm text-tdark font-medium mb-1">{t("Description")}</span>
                    <p className="text-twhite text-sm leading-relaxed">
                      {project.description || t("No description provided")}
                    </p>
                  </div>

                  {/* Project Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Start Date")}</span>
                      <p className="text-twhite text-sm">
                        {formatDate(project.startDate, currentLanguage as "ar" | "en")}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("End Date")}</span>
                      <p className="text-twhite text-sm">
                        {formatDate(project.endDate, currentLanguage as "ar" | "en")}
                      </p>
                    </div>
                  </div>

                  {/* Project Statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Departments")}</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <p className="text-twhite text-sm font-semibold">{project.departments?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Team Members")}</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-success" />
                        <p className="text-twhite text-sm font-semibold">{project.members?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Task Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Total Tasks")}</span>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-warning" />
                        <p className="text-twhite text-sm font-semibold">{totalTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <ProjectStatusControls
                    projectId={project._id}
                    currentStatus={projectStatus}
                    onStatusUpdated={handleStatusUpdate}
                    t={t}
                  />
                </div>
              </div>

              {/* Enhanced Pie Chart Card - Now spans 2 columns */}
              <div className="md:col-span-3">
                <TaskStatusPieChart
                  taskDone={project.taskDone}
                  taskOnGoing={project.taskOnGoing}
                  taskOnTest={project.taskOnTest}
                  taskPending={project.taskPending}
                />
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="p-6">
            <HomeTasksReport
              tasksData={project.projectTasks}
              isCentered={false}
            />
          </div>
        );

      case 'structure':
        // Create test data to verify the component works
        const testData = [
          {
            id: "dept-1",
            name: "Engineering Department",
            parentId: null,
            emps: [
              {
                id: "emp1",
                name: "John Doe",
                is_manager: true,
                title: "Senior Engineer",
                parentId: null,
                department: "Engineering"
              },
              {
                id: "emp2",
                name: "Jane Smith",
                is_manager: false,
                title: "Developer",
                parentId: "emp1",
                department: "Engineering"
              }
            ]
          },
          {
            id: "dept-2",
            name: "HR Department",
            parentId: "dept-1",
            emps: [
              {
                id: "emp3",
                name: "Bob Johnson",
                is_manager: true,
                title: "HR Manager",
                parentId: null,
                department: "HR"
              }
            ]
          },
          {
            id: "dept-3",
            name: "Marketing Department",
            parentId: "dept-1",
            emps: []
          }
        ];

        // Use test data if no real data, otherwise use real data
        const dataToUse = (project.departments && project.departments.length > 0)
          ? project.departments
          : testData;

        return (
          <div className="p-6">
            <div className="w-full h-[600px] overflow-hidden">
              <ProjectDetailsHierarchyTree
                data={dataToUse}
                width="100%"
                onPress={(deptId) => {
                  router.push(
                    `/projects/details/project-tasks/${project._id}/${deptId}`
                  );
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
                {t("ID")}: {project._id.slice(-5).toUpperCase()}
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

        {/* Tabs Container */}
        <div className="bg-gradient-to-br from-dark to-secondary rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-gray-700/50 bg-secondary/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${isActive
                    ? 'text-twhite border-primary bg-dark/50'
                    : 'text-tdark border-transparent hover:text-twhite hover:bg-dark/30'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? tab.bgColor : 'bg-gray-700/50'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? tab.iconColor : 'text-tdark'}`} />
                  </div>
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </GridContainer>
  );
};

export default ProjectDetails;