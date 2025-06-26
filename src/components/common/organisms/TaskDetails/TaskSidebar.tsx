import useLanguage from "@/hooks/useLanguage";
import { ReceiveTaskType } from "@/types/Task.type";
import {
  Layers,
  Target,
  Plus,
  ChevronRight,
  ExternalLink,
  Hash,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskSidebarProps {
  task: ReceiveTaskType;
  allTasks?: ReceiveTaskType[];
  onAddSubtask: () => void;
}

interface Subtask {
  id: string;
  name: string;
  status?: string;
  priority?: string;
  assignee?: {
    name: string;
  };
  due_date?: string;
  [key: string]: unknown;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "DONE":
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case "ONGOING":
      return <Clock className="w-4 h-4 text-blue-400" />;
    case "PENDING":
      return <AlertCircle className="w-4 h-4 text-amber-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "MEDIUM":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "LOW":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  task,
  allTasks,
  onAddSubtask,
}) => {
  const { t } = useLanguage();
  const router = useRouter();

  // Ensure subtasks is an array and assignee is always { name: string } | undefined
  const subtasks: Subtask[] = Array.isArray(task.subtasks)
    ? task.subtasks.map((sub) => ({
      ...sub,
      assignee: sub.assignee && sub.assignee.name
        ? { name: sub.assignee.name }
        : undefined,
    }))
    : Array.isArray((task as any).subTasks)
      ? (task as any).subTasks
      : [];

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const parentTask = task.parent_task && allTasks && Array.isArray(allTasks)
    ? allTasks.find((t: ReceiveTaskType) => t.id === task.parent_task)
    : null;

  const completedSubtasks = subtasks.filter(sub => sub.status === "DONE").length;
  const totalSubtasks = subtasks.length;

  return (
    <div className="space-y-6">
      {/* Parent Task Card */}
      {parentTask && (
        <div className="bg-secondary rounded-xl border border-gray-700 overflow-hidden transition-all duration-200 hover:border-gray-600">
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-twhite flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              {t("Parent Task")}
            </h2>
          </div>

          <div className="p-6">
            <div
              className="group p-4 bg-dark/50 rounded-lg border border-gray-700/50 cursor-pointer 
                transition-all duration-200 hover:bg-dark/70 hover:border-orange-400/50 hover:shadow-lg"
              onClick={() => handleTaskClick(parentTask.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-twhite group-hover:text-orange-200 transition-colors truncate">
                    {parentTask.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(parentTask.priority)}`}>
                      {t(parentTask.priority || "LOW")}
                    </span>
                    {getStatusIcon(parentTask.status || "PENDING")}
                  </div>

                  {parentTask.assignee && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <User className="w-3 h-3" />
                      {parentTask.assignee.name}
                    </div>
                  )}
                </div>

                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtasks Card */}
      <div className="bg-secondary rounded-xl border border-gray-700 overflow-hidden transition-all duration-200 hover:border-gray-600">
        <div className="bg-dark px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-twhite flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              {t("Subtasks")}
            </h2>

            {/* Progress indicator */}
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-400">
                  {completedSubtasks}/{totalSubtasks}
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                    style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Add Subtask Button */}
          <button
            onClick={onAddSubtask}
            className="w-full p-4 bg-dark border-2 border-dashed border-gray-600 rounded-lg 
              text-gray-400 hover:text-purple-400 hover:border-purple-400/50 hover:bg-purple-500/5
              transition-all duration-200 group flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{t("Add New Subtask")}</span>
          </button>

          {/* Subtasks List */}
          {totalSubtasks > 0 && (
            <div className="mt-4 space-y-3">
              <div className="text-sm font-medium text-gray-300 px-2">
                {t("Existing Subtasks")}
              </div>

              {subtasks.map((subtask: Subtask, index: number) => (
                <div
                  key={subtask.id || index}
                  className="group p-4 bg-dark rounded-lg border border-gray-700/50 cursor-pointer 
                    transition-all duration-200 hover:bg-dark/70 hover:border-purple-400/50 hover:shadow-md"
                  onClick={() => handleTaskClick(subtask.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <h4 className="font-medium text-twhite group-hover:text-purple-200 transition-colors truncate">
                          {subtask.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {getStatusIcon(subtask.status || "PENDING")}

                        {subtask.priority && (
                          <span className={`px-2 py-1 rounded-full font-medium border ${getPriorityColor(subtask.priority)}`}>
                            {t(subtask.priority)}
                          </span>
                        )}

                        {subtask.assignee && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <User className="w-3 h-3" />
                            {subtask.assignee.name}
                          </div>
                        )}

                        {subtask.due_date && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(subtask.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {totalSubtasks === 0 && (
            <div className="mt-6 text-center py-8">
              <div className="p-4 rounded-full bg-gray-700/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Layers className="w-8 h-8 text-gray-500 opacity-50" />
              </div>
              <p className="text-gray-400 text-sm mb-2">{t("No subtasks created yet")}</p>
              <p className="text-gray-500 text-xs">{t("Break down this task into smaller, manageable pieces")}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};