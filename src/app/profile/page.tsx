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
    queryKey: ["tasks"],
    url: `/tasks/${isAdmin
        ? "get-all-tasks"
        : isPrimary
          ? "get-my-dept-tasks"
          : "get-emp-tasks"
      }`,
    nestedData: true,
  });
  const currently =
    tasksData &&
    tasksData.filter((task) => !task.is_over_due && task.status != "DONE")
      .length;
  const overdue =
    tasksData && tasksData.filter((task) => task.is_over_due).length;
  const completed =
    tasksData && tasksData.filter((task) => task.status == "DONE").length;

  return (
    <GridContainer>
      <div className="col-span-full min-h-screen bg-main p-6">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-3xl font-bold text-white">
              {info?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {info?.name}
              </h1>
              <p className="text-slate-400">
                {info?.job?.title} at {info?.department?.name}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="gap-6">
            {/* Custom Tabs */}
            <div className="bg-dark rounded-lg p-1">
              <div className="flex justify-between gap-2">
                {["overview", "tasks", "projects"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${activeTab === tab
                        ? "bg-tblack text-white"
                        : "text-slate-400 hover:text-white hover:bg-tblack   "
                      }`}
                  >
                    {t(tab.charAt(0).toUpperCase() + tab.slice(1))}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-dark border border-slate-700 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">
                      {t("Personal Information")}
                    </h2>
                  </div>
                  <div className="p-4 gap-4">
                    <PersonalInfoCard
                      icon={Phone}
                      label="Phone"
                      value={info?.phone}
                    />
                    <PersonalInfoCard
                      icon={Mail}
                      label="Email"
                      value={info?.email}
                    />
                    <PersonalInfoCard
                      icon={MapPin}
                      label="Address"
                      value={info?.address}
                    />
                    {info && (
                      <PersonalInfoCard
                        icon={Calendar}
                        label="Date Of Birth"
                        value={formatDate(
                          info!.dob,
                          currentLanguage as "ar" | "en"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-dark border border-slate-700 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">
                      {t("Work Details")}
                    </h2>
                  </div>
                  <div className="p-4 gap-4">
                    <PersonalInfoCard
                      icon={Building2}
                      label="Department"
                      value={info?.department?.name}
                    />
                    <PersonalInfoCard
                      icon={Briefcase}
                      label="Job Title"
                      value={info?.job?.title}
                    />
                    {info && (
                      <PersonalInfoCard
                        icon={Calendar}
                        label="Employment Date"
                        value={formatDate(
                          info!.employment_date,
                          currentLanguage as "ar" | "en"
                        )}
                      />
                    )}
                    <PersonalInfoCard
                      icon={Briefcase}
                      label="Base Salary"
                      value={info?.base_salary}
                    />
                  </div>
                </div>

                {/* Task Overview */}
                <div className="md:col-span-2 bg-dark border border-slate-700 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">
                      {t("Task Overview")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <TaskStatusBadge
                        count={currently + ""}
                        label="Current Tasks"
                        color="text-blue-400"
                      />
                      <TaskStatusBadge
                        count={overdue + ""}
                        label="Overdue"
                        color="text-red-400"
                      />
                      <TaskStatusBadge
                        count={completed + ""}
                        label="Completed"
                        color="text-green-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="bg-dark border border-slate-700 rounded-lg p-6">
                <HomeTasksReport tasksData={tasksData} isCentered={false} />
              </div>
            )}

            {activeTab === "projects" && (
              <div className="bg-dark border border-slate-700 rounded-lg p-6">
                <ProfileProjectsReport />
              </div>
            )}
          </div>
        </div>
      </div>
    </GridContainer>
  );
};

export default Profile;
