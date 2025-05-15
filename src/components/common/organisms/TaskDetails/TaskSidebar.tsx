import Image from "next/image";
import { SubtasksIcon } from "@/assets";
import useLanguage from "@/hooks/useLanguage";
import { ExtendedReceiveTaskType } from "@/types/Task.type";
import { Star, Target, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskSidebarProps {
  task: any;
  allTasks?: any[];
  onAddSubtask: () => void;
  canAddSubtask: boolean;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  task,
  allTasks,
  onAddSubtask,
  canAddSubtask,
}) => {
  const { t } = useLanguage();
  const router = useRouter();

  // Ensure subtasks is an array
  const subtasks = Array.isArray(task.subtasks)
    ? task.subtasks
    : Array.isArray(task.subTasks)
      ? task.subTasks
      : [];

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Subtasks */}
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          {t("Subtasks")}
        </h2>

        {subtasks.length > 0 ? (
          <div className="space-y-2">
            {subtasks.map((subtask: any, index: number) => (
              <div
                key={index}
                className="group flex items-center gap-2 p-3 bg-dark rounded-lg cursor-pointer 
                  transition-all ease-in-out 
                  hover:bg-opacity-80 hover:scale-[1.02] hover:shadow-md hover:border-l-4 hover:border-purple-500"
                onClick={() => handleTaskClick(subtask.id)}
                title={subtask.name}
              >
                <Layers className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-twhite group-hover:text-purple-200 transition-colors">
                  {subtask.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">{t("No subtasks yet.")}</p>
        )}

        {canAddSubtask && (
          <button
            onClick={onAddSubtask}
            className="w-full mt-4 py-2 bg-dark text-twhite rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t("Add Subtask")}
          </button>
        )}
      </div>

      {/* Task Rating */}
      {task.rate !== undefined && task.rate !== null && (
        <div className="bg-secondary rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            {t("Task Rating")}
          </h2>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${i < (task.rate || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
              />
            ))}
          </div>
          <p className="text-center text-gray-400 mt-2">{task.rate}/5</p>
        </div>
      )}

      {/* Parent Task */}
      {task.parent_task && (
        <div className="bg-secondary rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            {t("Parent Task")}
          </h2>
          <div className="p-3 bg-dark rounded-lg">
            <span className="text-twhite">
              {allTasks?.find((t: any) => t.id === task.parent_task)?.name || t("No Parent Task")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};