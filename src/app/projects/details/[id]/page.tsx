"use client";

import { Pagination } from '@/components/common/atoms/Pagination';
import ProjectDetailsHierarchyTree from "@/components/common/atoms/ProjectDetailsHierarchyTree";
import ProjectStatusControls from "@/components/common/atoms/projects/ProjectStatusControls";
import TaskStatusPieChart from "@/components/common/atoms/tasks/TaskStatusPieChart";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate } from "@/services/task.service";
import { ProjectDetailsType, ProjectStatus, TeamMember, TeamStats } from "@/types/Project.type";
import { ReceiveTaskType } from "@/types/Task.type";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Layers,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";



// Function to calculate text color based on background color
const getTextColor = (backgroundColor: string): string => {
  // Remove the # if it exists
  const hex = backgroundColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance - using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Function to create lighter/darker versions of the main color
const createColorVariants = (baseColor: string) => {
  // Remove the # if it exists
  const hex = baseColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create lighter version (20% lighter)
  const lighter = {
    r: Math.min(255, r + 51),
    g: Math.min(255, g + 51),
    b: Math.min(255, b + 51)
  };

  // Create darker version (20% darker)
  const darker = {
    r: Math.max(0, r - 51),
    g: Math.max(0, g - 51),
    b: Math.max(0, b - 51)
  };

  // Convert back to hex
  const lighterHex = `#${lighter.r.toString(16).padStart(2, '0')}${lighter.g.toString(16).padStart(2, '0')}${lighter.b.toString(16).padStart(2, '0')}`;
  const darkerHex = `#${darker.r.toString(16).padStart(2, '0')}${darker.g.toString(16).padStart(2, '0')}${darker.b.toString(16).padStart(2, '0')}`;

  return {
    base: baseColor,
    light: lighterHex,
    dark: darkerHex,
    text: getTextColor(baseColor)
  };
};

// Custom TeamMembersContent for API compatibility
const TeamMembersContent = ({ team, t, onCountChange }: { team: TeamMember[], t: (key: string) => string, onCountChange?: (count: number) => void }) => {
  // Notify parent of the count
  useEffect(() => {
    if (onCountChange) onCountChange(team.length);
  }, [team.length, onCountChange]);

  if (team.length === 0) {
    return <div className="text-tdark p-4">{t('noTeamMembersFound')}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700/50 mt-4">
      <table className="min-w-full divide-y divide-gray-700 bg-dark text-twhite">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('NAME')}</th>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Department')}</th>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Total Hours Worked')}</th>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Total Planned Hours')}</th>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Completed Tasks')}</th>
            <th className="px-4 py-2 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Incomplete Tasks')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {team.map((member, idx) => (
            <tr key={idx} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap font-semibold">{member.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{member.department}</td>
              <td className="px-4 py-2 whitespace-nowrap">{Math.round(member.totalHoursWorked)}</td>
              <td className="px-4 py-2 whitespace-nowrap">{Math.round(member.totalPlannedHours)}</td>
              <td className="px-4 py-2 whitespace-nowrap">{member.completedTasks}</td>
              <td className="px-4 py-2 whitespace-nowrap">{member.incompleteTasks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProjectDetails = ({ params: { id } }: { params: { id: string } }) => {
  const { t, currentLanguage, getDir } = useLanguage();
  const isRTL = getDir() == "rtl";

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'structure' | 'team'>('info');
  const [teamCount, setTeamCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: project, isLoading } = useCustomQuery<ProjectDetailsType>({
    queryKey: ["project-details", id],
    url: `/projects/project-details/${id}`,
  });

  const [projectStatus, setProjectStatus] = useState<ProjectStatus | undefined>(undefined);

  // Create color theme based on project color
  const colorTheme = useMemo(() => {
    if (project?.color) {
      return createColorVariants(project.color);
    }
    // Default color if no project color is set
    return createColorVariants('#6D28D9');
  }, [project?.color]);

  useEffect(() => {
    if (project?.status) {
      setProjectStatus(project.status);
    }
  }, [project]);

  const handleStatusUpdate = (newStatus: ProjectStatus) => {
    setProjectStatus(newStatus);
  };

  // Helper to get general status
  const getGeneralStatus = (task: ReceiveTaskType, t: (key: string) => string) => {
    if (task.is_over_due) return t('Overdue');
    if (['DONE', 'CLOSED', 'CANCELED'].includes(task.status)) return t('Completed');
    return t('Current');
  };

  // Helper to get specific status label
  const getSpecificStatus = (task: ReceiveTaskType, t: (key: string) => string) => {
    const map: Record<string, string> = {
      'PENDING': t('Pending'),
      'ONGOING': t('Ongoing'),
      'ON_TEST': t('On Test'),
      'DONE': t('Done'),
      'CLOSED': t('Closed'),
      'CANCELED': t('Canceled'),
    };
    return map[task.status] || task.status;
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
    },
    {
      id: 'team' as const,
      label: t("Team Members"),
      icon: Users,
      iconColor: 'text-info',
      bgColor: 'bg-info/20'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
              {/* Project Details Card */}
              <div
                className="md:col-span-2 bg-dark p-5 rounded-xl border shadow-md flex flex-col"
                style={{
                  borderColor: `${colorTheme.base}50`,
                  boxShadow: `0 4px 12px ${colorTheme.base}15`
                }}
              >
                <h3 className="text-lg font-semibold text-twhite mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" style={{ color: colorTheme.base }} />
                  {t("Details")}
                </h3>

                <div className="space-y-4 flex-1">
                  {/* Description */}
                  <div className="flex flex-col">
                    <span className="text-sm text-tdark font-medium mb-1">{t("Description")}</span>
                    <p className="text-twhite text-sm leading-relaxed">
                      {project?.description || t("No description provided")}
                    </p>
                  </div>

                  {/* Project Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Start Date")}</span>
                      <p className="text-twhite text-sm">
                        {formatDate(project?.startDate, currentLanguage as "ar" | "en")}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("End Date")}</span>
                      <p className="text-twhite text-sm">
                        {formatDate(project?.endDate, currentLanguage as "ar" | "en")}
                      </p>
                    </div>
                  </div>

                  {/* Project Statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Departments")}</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: colorTheme.base }} />
                        <p className="text-twhite text-sm font-semibold">{project?.departments?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Team Members")}</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: colorTheme.base }} />
                        <p className="text-twhite text-sm font-semibold">{teamCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Task Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-tdark font-medium mb-1">{t("Total Tasks")}</span>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" style={{ color: colorTheme.base }} />
                        <p className="text-twhite text-sm font-semibold">{totalTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <ProjectStatusControls
                    projectId={project?._id ?? ''}
                    currentStatus={projectStatus}
                    onStatusUpdated={handleStatusUpdate}
                    t={t}
                  />
                </div>
              </div>

              {/* Enhanced Pie Chart Card - Now spans 2 columns */}
              <div
                className="md:col-span-3 bg-dark p-5 rounded-xl border shadow-md"
                style={{
                  borderColor: `${colorTheme.base}50`,
                  boxShadow: `0 4px 12px ${colorTheme.base}15`
                }}
              >
                <TaskStatusPieChart
                  taskDone={project?.taskDone ?? 0}
                  taskOnGoing={project?.taskOnGoing ?? 0}
                  taskOnTest={project?.taskOnTest ?? 0}
                  taskPending={project?.taskPending ?? 0}
                />
              </div>
            </div>
          </div>
        );

      case 'tasks':
        const allTasks = project?.projectTasks || [];
        const totalItems = allTasks.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTasks = allTasks.slice(startIndex, endIndex);
        // Helper for priority badge
        const getPriorityBadge = (priority: string) => {
          const map: Record<string, { color: string; label: string }> = {
            'HIGH': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: t('High') },
            'MEDIUM': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: t('Medium') },
            'LOW': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: t('Low') },
          };
          const config = map[priority] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: priority };
          return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
        };
        return (
          <div className="p-6 border-t-4" style={{ borderColor: colorTheme.base }}>
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700/50 bg-dark">
              <table className="min-w-full divide-y divide-gray-700 bg-dark text-twhite">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Task Name')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Assigned To')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Department')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Due Date')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Estimated Hours')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Actual Hours')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Priority')}</th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-bold uppercase tracking-wider">{t('Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedTasks.map((task, idx) => (
                    <tr key={task?.id || idx} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{task?.name ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task?.assignee?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task?.department?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task?.due_date ? new Date(task.due_date).toLocaleDateString(currentLanguage) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task?.estimated_hours ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task?.actual_hours ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(task?.priority ?? '')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block text-xs font-semibold">
                            {getGeneralStatus(task, t)}
                          </span>
                          <span className="inline-block text-xs text-gray-400">
                            {getSpecificStatus(task, t)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(items: number) => { setItemsPerPage(items); setCurrentPage(1); }}
                totalItems={totalItems}
                t={t}
              />
            </div>
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
        const dataToUse = (project?.departments && project.departments.length > 0)
          ? project.departments
          : testData;

        return (
          <div
            className="p-6 border-t-4"
            style={{ borderColor: colorTheme.base }}
          >
            <div className="w-full h-[600px] overflow-hidden bg-dark rounded-xl border shadow-md"
              style={{
                borderColor: `${colorTheme.base}50`,
                boxShadow: `0 4px 12px ${colorTheme.base}15`
              }}
            >
              <ProjectDetailsHierarchyTree
                data={dataToUse}
                onPress={() => { }}
              />
            </div>
          </div>
        );

      case 'team':
        // Use TeamStats type for stats
        const stats: TeamStats | undefined = project?.teamStats;
        return (
          <div className="p-4 border-t-4" style={{ borderColor: colorTheme.base }}>
            <div className="mb-4 bg-dark rounded-lg p-4 border border-gray-700/50 shadow-md">
              <h3 className="text-base font-semibold text-twhite mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-info" />
                {t('teamMembersStats')}
              </h3>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-twhite text-sm">
                  <div className="flex flex-col">
                    <span className="text-tdark font-semibold">{t('totalMembers')}</span>
                    <span>{teamCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-tdark font-semibold">{t('totalTeamTime')}</span>
                    <span>{stats ? Math.round(stats.totalTeamTime) : 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-tdark font-semibold">{t('averageTimePerMember')}</span>
                    <span>{stats ? Math.round(stats.averageTimePerMember) : 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-tdark font-semibold">{t('mostActiveMembers')}</span>
                    <span>{stats.mostActiveMembers.length} {t('members')}</span>
                    {stats.mostActiveMembers.length > 0 && (
                      <span>{t('first')}: {stats.mostActiveMembers[0].name}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-tdark">{t('noTeamStatsAvailable')}</div>
              )}
            </div>
            <TeamMembersContent team={project?.team || []} t={t} onCountChange={setTeamCount} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GridContainer>
      <div className="col-span-full px-4 md:px-6">
        {/* Header with Color Theme */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${colorTheme.base}15, ${colorTheme.base}25)`,
            borderLeft: `4px solid ${colorTheme.base}`,
            boxShadow: `0 4px 12px ${colorTheme.base}15`
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-dark transition-colors"
              style={{ backgroundColor: `${colorTheme.base}30` }}
            >
              {!isRTL ? <ArrowLeft className="w-5 h-5 text-twhite" /> : <ArrowRight className="w-5 h-5 text-twhite" />}
            </button>
            <div className="flex items-center gap-3">
              {/* Color indicator */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: colorTheme.base,
                  boxShadow: `0 4px 12px ${colorTheme.base}50`
                }}
              >
                <Briefcase className="w-6 h-6" style={{ color: colorTheme.text }} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-twhite">
                  {project?.name ?? t("No Project Name")}
                </h1>
                <p className="text-tdark text-sm md:text-base">
                  {t("ID")}: {(project?._id ?? "").slice(-5).toUpperCase()}
                </p>
              </div>
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
              <Calendar className="w-4 h-4" style={{ color: colorTheme.base }} />
              {formatDate(project?.startDate, currentLanguage as "ar" | "en")} - {formatDate(project?.endDate, currentLanguage as "ar" | "en")}
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div
          className="bg-gradient-to-br from-dark to-secondary rounded-xl shadow-lg border border-gray-700/50 overflow-hidden"
          style={{ boxShadow: `0 8px 32px ${colorTheme.base}15` }}
        >
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
                    ? 'text-twhite bg-dark/50'
                    : 'text-tdark border-transparent hover:text-twhite hover:bg-dark/30'
                    }`}
                  style={{
                    borderBottomColor: isActive ? colorTheme.base : 'transparent',
                    borderBottomWidth: isActive ? '2px' : '2px'
                  }}
                >
                  <div
                    className={`p-1.5 rounded-lg ${isActive ? 'bg-opacity-20' : 'bg-gray-700/50'}`}
                    style={{
                      backgroundColor: isActive ? colorTheme.base : '',
                      opacity: isActive ? 0.2 : 1
                    }}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-base' : 'text-white'}`}
                      style={{ color: isActive ? "white" : '' }}
                    />
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