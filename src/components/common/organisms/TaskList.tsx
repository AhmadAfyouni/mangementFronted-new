import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useHierarchy from "@/hooks/useHierarchy";
import { categorizeTasks } from "@/services/task.service";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { useEffect, useState } from "react";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import { Plus, ListChecks, Calendar, CircleCheckBig, Settings, FolderOpen } from "lucide-react";

const ListTasks = ({
  tasksData,
  sections,
}: {
  tasksData: ReceiveTaskType[] | undefined;
  sections: SectionType[] | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<{
    [key: string]: ReceiveTaskType[];
  }>({});
  const { isLightMode } = useCustomTheme();
  const { t, currentLanguage } = useLanguage();
  const { renderTaskWithSubtasks, organizeTasksByHierarchy } = useHierarchy();

  useEffect(() => {
    if (tasksData) {
      const categorizedTasks = categorizeTasks(tasksData);
      setTasks(categorizedTasks);
    }
  }, [tasksData]);

  const isRTL = currentLanguage === "ar";

  // Flatten all tasks with their section information
  const getAllTasksWithSections = () => {
    const allTasks: Array<{ task: ReceiveTaskType; sectionName: string }> = [];

    if (sections && tasks) {
      sections.forEach((section) => {
        const sectionTasks = tasks[section._id] || [];
        sectionTasks.forEach((task) => {
          allTasks.push({
            task,
            sectionName: section.name
          });
        });
      });
    }

    return allTasks;
  };

  const allTasksWithSections = getAllTasksWithSections();
  const organizedTasks = organizeTasksByHierarchy(allTasksWithSections.map(item => item.task));

  // Create a map to get section name for each task
  const taskSectionMap = new Map<string, string>();
  allTasksWithSections.forEach(({ task, sectionName }) => {
    taskSectionMap.set(task.id, sectionName);
  });

  return (
    <>
      <div className="bg-main rounded-lg p-4 w-full h-full">
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block min-w-full bg-main rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 bg-secondary/50 border-b border-gray-700">
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <ListChecks className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-twhite">{t("Task Name")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-twhite">{t("Due Date")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <CircleCheckBig className="w-5 h-5 text-green-400" />
              <span className="font-bold text-twhite">{t("Status")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <FolderOpen className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-twhite">{t("Section")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <Settings className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-twhite">{t("Actions")}</span>
            </div>
          </div>

          {/* Table Body with All Tasks */}
          <div>
            {organizedTasks && organizedTasks.length > 0 ? (
              organizedTasks.map((task) => {
                // Pass the section name as a prop to the task row
                const sectionName = taskSectionMap.get(task.id) || t("Unknown Section");
                return renderTaskWithSubtasks(task, 0, sectionName);
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ListChecks className="w-16 h-16 mb-4 text-gray-600" />
                <p className="text-lg font-medium mb-2">{t("No tasks available")}</p>
                <p className="text-sm">{t("Create tasks to see them here")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View - Visible only on mobile */}
        <div className="md:hidden space-y-4">
          {organizedTasks && organizedTasks.length > 0 ? (
            organizedTasks.map((task) => {
              const sectionName = taskSectionMap.get(task.id) || t("Unknown Section");

              const renderMobileTaskCard = (taskItem: any, level: number = 0) => (
                <div
                  key={taskItem.id}
                  className={`bg-dark rounded-lg p-4 border-l-4 hover:bg-secondary/50 transition-all duration-300 cursor-pointer ${taskItem.status === "DONE" ? "border-green-400" :
                      taskItem.status === "ONGOING" ? "border-blue-400" :
                        taskItem.status === "ON_TEST" ? "border-yellow-400" :
                          "border-gray-400"
                    } ${level > 0 ? `ml-${level * 4} mt-2` : ""}`}
                  onClick={() => window.location.href = `/tasks/${taskItem.id}`}
                  style={{ marginLeft: level > 0 ? `${level * 16}px` : '0' }}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {taskItem.parent_task ? (
                          <span className="text-xs bg-secondary/50 px-2 py-1 rounded text-gray-400">
                            📋 {t("Subtask")}
                          </span>
                        ) : null}
                        <h3 className="text-twhite font-semibold text-base">{taskItem.name}</h3>
                      </div>
                      {taskItem.assignee && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <span>👤</span>
                          <span>{taskItem.assignee.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskItem.status === "DONE" ? "bg-green-500/20 text-green-400" :
                          taskItem.status === "ONGOING" ? "bg-blue-500/20 text-blue-400" :
                            taskItem.status === "ON_TEST" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-gray-500/20 text-gray-400"
                        }`}>
                        {t(taskItem.status)}
                      </span>
                    </div>
                  </div>

                  {/* Task Details Grid */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{t("Due Date")}</span>
                        </div>
                        <span className={`text-sm ${taskItem.is_over_due ? "text-red-500" : "text-gray-300"}`}>
                          {new Date(taskItem.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          <FolderOpen className="w-4 h-4" />
                          <span>{t("Section")}</span>
                        </div>
                        <span className="text-sm text-orange-400 font-medium">{sectionName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Tracking and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-2 rounded-lg">
                      <span className="text-blue-400">⏱️</span>
                      <span className="text-sm text-gray-300">
                        {Math.floor((taskItem?.totalTimeSpent || 0) / 3600)}h {Math.floor(((taskItem?.totalTimeSpent || 0) % 3600) / 60)}m
                      </span>
                    </div>

                    <button
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/tasks/${taskItem.id}`;
                      }}
                    >
                      {t("View Details")}
                    </button>
                  </div>

                  {/* Subtasks indicator */}
                  {taskItem.subTasks && taskItem.subTasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-xs text-gray-400">
                        📋 {taskItem.subTasks.length} {t("subtasks")}
                      </span>
                    </div>
                  )}
                </div>
              );

              return (
                <div key={task.id}>
                  {renderMobileTaskCard(task, 0)}
                  {task.subTasks && task.subTasks.map((subTask) =>
                    renderMobileTaskCard(subTask, 1)
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ListChecks className="w-16 h-16 mb-4 text-gray-600" />
              <p className="text-lg font-medium mb-2 text-center">{t("No tasks available")}</p>
              <p className="text-sm text-center">{t("Create tasks to see them here")}</p>
            </div>
          )}
        </div>

        {/* Enhanced Add Section Button */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`group flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-dashed transition-all duration-300 ${isLightMode
              ? "border-darkest text-darkest hover:bg-darkest hover:text-tblackAF hover:border-solid"
              : "border-gray-600 text-gray-400 hover:bg-secondary hover:text-twhite hover:border-gray-500 hover:border-solid"
              }`}
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="font-medium">{t("Add Section")}</span>
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <AddSectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ListTasks;
