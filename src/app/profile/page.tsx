"use client";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PersonalInfoCard from "@/components/common/atoms/ProfileInfoCard";
import TaskStatusBadge from "@/components/common/atoms/tasks/TaskStatusBadge";
import HomeTasksReport from "@/components/common/molcules/HomeTasksReport";
import ProfileProjectsReport from "@/components/common/molcules/ProfileProjectsReport";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import { formatDate } from "@/services/task.service";
import { RootState } from "@/state/store";
import { ReceiveTaskType } from "@/types/Task.type";
import {
  Briefcase,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Target,
  Activity,
} from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { selector: info } = useRedux(
    (state: RootState) => state.user.userInfo
  );
  const { } = useCustomTheme();
  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const { currentLanguage, t } = useLanguage();
  const { data: tasksData } = useCustomQuery<ReceiveTaskType[]>({
    queryKey: ["tasks", isAdmin ? "admin" : isPrimary ? "primary" : "employee"],
    url: `/tasks/${isAdmin
      ? "get-all-tasks"
      : isPrimary
        ? "get-my-dept-tasks"
        : "get-emp-tasks"
      }`,
    nestedData: true,
  });

  // Ensure consistent filtering logic
  const currentTasks = tasksData?.filter((task) => task.status !== "DONE" && !task.is_over_due) || [];
  const overdueTasks = tasksData?.filter((task) => task.is_over_due && task.status !== "DONE") || [];
  const completedTasks = tasksData?.filter((task) => task.status === "DONE") || [];

  const currently = currentTasks.length;
  const overdue = overdueTasks.length;
  const completed = completedTasks.length;
  const total = tasksData?.length || 0;

  const isRTL = currentLanguage === "ar";

  // Calculate performance metrics
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const onTimeRate = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;

  return (
    <GridContainer>
      <div className={`col-span-full min-h-screen bg-main ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Enhanced Profile Header */}
          <div className="bg-secondary rounded-2xl shadow-xl p-8 mb-6">
            <div className={`flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Enhanced Avatar with gradient ring */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-1">
                  <div className="w-full h-full rounded-full bg-tblack flex items-center justify-center">
                    <span className="text-4xl font-bold text-twhite">
                      {info?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-secondary"></div>
              </div>

              {/* Profile Info */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h1 className="text-4xl font-bold text-twhite mb-2">
                  {info?.name}
                </h1>
                <p className="text-xl text-gray-400 mb-4">
                  {info?.job?.title} {isRTL ? 'في' : 'at'} {info?.department?.name}
                </p>

                {/* Quick Stats */}
                <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="text-twhite">{total} {t("Total Tasks")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-twhite">{completionRate}% {t("Completion Rate")}</span>
                  </div>
                  {info?.job?.grade_level && (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-twhite">{info.job.grade_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="bg-secondary rounded-xl shadow-lg p-2 mb-6">
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {[
                { id: "overview", icon: User },
                { id: "tasks", icon: CheckCircle2 },
                { id: "projects", icon: Briefcase }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 ${activeTab === tab.id
                    ? "bg-tblack text-twhite shadow-lg transform scale-105"
                    : "text-gray-400 hover:text-twhite hover:bg-dark"
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{t(tab.id.charAt(0).toUpperCase() + tab.id.slice(1))}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary border border-gray-700 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                    <span className="text-3xl font-bold text-green-400">{completed}</span>
                  </div>
                  <h3 className="text-twhite font-medium">{t("Completed")}</h3>
                  <p className="text-sm text-gray-400 mt-1">{completionRate}% {t("of total")}</p>
                </div>

                <div className="bg-secondary border border-gray-700 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-10 h-10 text-blue-400" />
                    <span className="text-3xl font-bold text-blue-400">{currently}</span>
                  </div>
                  <h3 className="text-twhite font-medium">{t("In Progress")}</h3>
                  <p className="text-sm text-gray-400 mt-1">{t("Active tasks")}</p>
                </div>

                <div className="bg-secondary border border-gray-700 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <span className="text-3xl font-bold text-red-400">{overdue}</span>
                  </div>
                  <h3 className="text-twhite font-medium">{t("Overdue")}</h3>
                  <p className="text-sm text-gray-400 mt-1">{t("Need attention")}</p>
                </div>

                <div className="bg-secondary border border-gray-700 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-10 h-10 text-purple-400" />
                    <span className="text-3xl font-bold text-purple-400">{onTimeRate}%</span>
                  </div>
                  <h3 className="text-twhite font-medium">{t("On Time Rate")}</h3>
                  <p className="text-sm text-gray-400 mt-1">{t("Performance")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enhanced Personal Information Card */}
                <div className="bg-dark border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                  <div className={`p-6 border-b border-gray-700 bg-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-xl font-bold text-twhite flex items-center gap-2">
                      <User className="w-6 h-6 text-purple-400" />
                      {t("Personal Information")}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {info?.phone && (
                      <PersonalInfoCard
                        icon={Phone}
                        label="Phone"
                        value={info.phone}
                      />
                    )}
                    {info?.email && (
                      <PersonalInfoCard
                        icon={Mail}
                        label="Email"
                        value={info.email}
                      />
                    )}
                    {info?.address && (
                      <PersonalInfoCard
                        icon={MapPin}
                        label="Address"
                        value={info.address}
                      />
                    )}
                    {info?.dob && (
                      <PersonalInfoCard
                        icon={Calendar}
                        label="Date Of Birth"
                        value={formatDate(
                          info.dob,
                          currentLanguage as "ar" | "en"
                        )}
                      />
                    )}
                    {info?.phone && (
                      <PersonalInfoCard
                        icon={Phone}
                        label="Emergency Contact"
                        value={info.emergency_contact}
                      />
                    )}
                  </div>
                </div>

                {/* Enhanced Work Information Card */}
                <div className="bg-dark border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                  <div className={`p-6 border-b border-gray-700 bg-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-xl font-bold text-twhite flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-blue-400" />
                      {t("Work Details")}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {info?.department?.name && (
                      <PersonalInfoCard
                        icon={Building2}
                        label="Department"
                        value={info.department.name}
                      />
                    )}
                    {info?.job?.title && (
                      <PersonalInfoCard
                        icon={Briefcase}
                        label="Job Title"
                        value={info.job.title}
                      />
                    )}
                    {info?.employment_date && (
                      <PersonalInfoCard
                        icon={Calendar}
                        label="Employment Date"
                        value={formatDate(
                          info.employment_date,
                          currentLanguage as "ar" | "en"
                        )}
                      />
                    )}
                    {info?.base_salary && (
                      <PersonalInfoCard
                        icon={Award}
                        label="Base Salary"
                        value={`${info.base_salary.toLocaleString()}`}
                      />
                    )}
                    {info?.job?.grade_level && (
                      <PersonalInfoCard
                        icon={TrendingUp}
                        label="Grade Level"
                        value={info.job.grade_level}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-dark border border-gray-700 rounded-xl p-6 shadow-xl">
              <HomeTasksReport
                tasksData={tasksData}
                isCentered={false}
                currentTasks={currentTasks}
                overdueTasks={overdueTasks}
                completedTasks={completedTasks}
              />
            </div>
          )}

          {activeTab === "projects" && (
            <div className="bg-dark border border-gray-700 rounded-xl p-6 shadow-xl">
              <ProfileProjectsReport />
            </div>
          )}
        </div>
      </div>
    </GridContainer>
  );
};

export default Profile;
