import React from 'react';
import { ReceiveTaskType } from "@/types/Task.type";
import useLanguage from "@/hooks/useLanguage";
import { Clock, CheckCircle2, AlertCircle, Target, CalendarDays, Eye } from "lucide-react";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";

interface HomeTasksReportProps {
  tasksData: ReceiveTaskType[] | undefined;
  isCentered?: boolean;
  currentTasks?: ReceiveTaskType[];
  overdueTasks?: ReceiveTaskType[];
  completedTasks?: ReceiveTaskType[];
}

const HomeTasksReport: React.FC<HomeTasksReportProps> = ({
  tasksData,
  isCentered = true,
  currentTasks: propCurrentTasks,
  overdueTasks: propOverdueTasks,
  completedTasks: propCompletedTasks
}) => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";

  if (!tasksData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twhite"></div>
      </div>
    );
  }

  // Use provided filtered tasks or apply the same filtering logic
  const currentTasks = propCurrentTasks || tasksData.filter((task) => task.status !== "DONE" && !task.is_over_due);
  const overdueTasks = propOverdueTasks || tasksData.filter((task) => task.is_over_due && task.status !== "DONE");
  const completedTasks = propCompletedTasks || tasksData.filter((task) => task.status === "DONE");

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "LOW":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (status === "DONE") return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (isOverdue) return <AlertCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  const renderTaskList = (tasks: ReceiveTaskType[], title: string, emptyMessage: string, titleIcon: React.ReactNode) => (
    <div className={`mb-8 `}>
      <div className={`flex items-center gap-3 mb-4 `}>
        {titleIcon}
        <h3 className="text-xl font-bold text-twhite">{title}</h3>
        <span className="text-sm text-gray-400 bg-tblack px-3 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-secondary rounded-lg p-6 text-center text-gray-400 border border-gray-700">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group px-4 py-3 bg-secondary rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300`}
            >
              <div className={`flex  items-center gap-3`}>
                {/* Status Icon */}
                {getStatusIcon(task.status, task.is_over_due)}

                {/* Task Name */}
                <h4 className="font-semibold text-twhite text-base group-hover:text-blue-400 transition-colors min-w-0 flex-shrink truncate max-w-[200px]">
                  {task.name}
                </h4>

                {/* Priority Badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                  <Target className="w-3 h-3" />
                  {t(task.priority)}
                </span>

                {/* Due Date */}
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString(isRTL ? 'ar' : 'en')}
                </span>

                {/* Assignee */}
                {task.assignee && (
                  <span className="text-xs text-gray-400 truncate max-w-[150px]">
                    {t("Assigned to")}: {task.assignee.name}
                  </span>
                )}

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-lg whitespace-nowrap ${task.status === "DONE"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : task.is_over_due
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    }`}
                >
                  {t(task.status)}
                </span>

                {/* Rating */}
                {task.rate !== undefined && (
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < (task.rate || 0)
                          ? "text-yellow-400"
                          : "text-gray-600"
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* View Details Button */}
                <RouteWrapper
                  href={`/tasks/${task.id}`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 border border-gray-600/20 hover:border-blue-500/30"
                >
                  <Eye className="w-3.5 h-3.5" />
                </RouteWrapper>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`${isCentered ? 'max-w-4xl mx-auto' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {renderTaskList(
        currentTasks,
        t("Current Tasks"),
        t("No current tasks"),
        <Clock className="w-6 h-6 text-blue-400" />
      )}
      {renderTaskList(
        overdueTasks,
        t("Overdue Tasks"),
        t("No overdue tasks"),
        <AlertCircle className="w-6 h-6 text-red-400" />
      )}
      {renderTaskList(
        completedTasks,
        t("Completed Tasks"),
        t("No completed tasks"),
        <CheckCircle2 className="w-6 h-6 text-green-400" />
      )}
    </div>
  );
};

export default HomeTasksReport;