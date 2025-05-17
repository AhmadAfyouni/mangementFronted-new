import React from 'react';
import { ReceiveTaskType } from "@/types/Task.type";
import useLanguage from "@/hooks/useLanguage";
import { Clock, CheckCircle2, AlertCircle, Target, CalendarDays } from "lucide-react";

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
    if (status === "DONE") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (isOverdue) return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <Clock className="w-5 h-5 text-blue-400" />;
  };

  const renderTaskList = (tasks: ReceiveTaskType[], title: string, emptyMessage: string, titleIcon: React.ReactNode) => (
    <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group p-5 bg-secondary rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-start gap-4`}>
                <div className="flex-1">
                  <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {getStatusIcon(task.status, task.is_over_due)}
                    <h4 className="font-semibold text-twhite text-lg group-hover:text-blue-400 transition-colors">
                      {task.name}
                    </h4>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-4 items-center flex-wrap`}>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                      <Target className="w-3 h-3" />
                      {t(task.priority)}
                    </span>
                    
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString(isRTL ? 'ar' : 'en')}
                    </span>
                    
                    {task.assignee && (
                      <span className="text-xs text-gray-400">
                        {t("Assigned to")}: {task.assignee.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`flex flex-col items-end gap-2 ${isRTL ? 'items-start' : ''}`}>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      task.status === "DONE"
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : task.is_over_due
                        ? "bg-red-500/20 text-red-400 border border-red-500/50"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    }`}
                  >
                    {t(task.status)}
                  </span>
                  
                  {task.rate !== undefined && (
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < (task.rate || 0)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
