import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate, getPriorityColor } from "@/services/task.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { AlertCircle, ChevronRight, Clock, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskHeaderProps {
  task: ReceiveTaskType;
  onUpdate: () => void;
  taskName: string;
  onNameChange: (newName: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  onUpdate,
  taskName,
  onNameChange,
  isEditing,
  onEditToggle
}) => {
  const { t, currentLanguage } = useLanguage();
  const {
    data: parentTask,
  } = useCustomQuery<ReceiveTaskType>({
    queryKey: ["parentTask", task.parent_task || ""],
    url: `/tasks/task/${task.parent_task || ""}`,
    nestedData: true,
    enabled: !!task.parent_task
  });

  const router = useRouter();

  const navigateToParent = () => {
    if (task.parent_task) {
      router.push(`/tasks/${task.parent_task}`);
    }
  };

  // Check if this is a subtask and get parent task info
  const isSubtask = !!task.parent_task;

  return (
    <div className="mb-6">
      {/* Parent task breadcrumb - shown above the main title */}
      {isSubtask && task.parent_task && (
        <div className="mb-3">
          <button
            onClick={navigateToParent}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium group-hover:underline">
              {parentTask?.name || 'Parent Task'}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-500 text-sm">{taskName}</span>
          </button>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* Task title with subtask indicator */}
            <div className="flex items-center gap-3">
              {isSubtask && (
                <div className="p-2 bg-slate-500/20 rounded-lg relative">
                  <Layers className="w-6 h-6 text-slate-400" />
                  {/* Small indicator dot */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" className="text-white">
                      <path d="M2 4 L3.5 5.5 L6 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={taskName}
                  onChange={e => onNameChange(e.target.value)}
                  className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 text-twhite outline-none px-2"
                  autoFocus
                />
              ) : (
                <h1 className={`text-3xl font-bold ${isSubtask ? 'text-slate-200' : 'text-twhite'}`}>
                  {taskName || 'Untitled Task'}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            {task.priority && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {t(task.priority)}
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(task.due_date, currentLanguage as "ar" | "en")}
              </span>
            )}
            {task.is_over_due && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-4 h-4" />
                {t("Overdue")}
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <button
            onClick={onUpdate}
            className={`px-6 py-2 rounded-lg transition-colors ${isSubtask
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {t("Save Changes")}
          </button>
        ) : (
          <button
            onClick={onEditToggle}
            className={`px-6 py-2 rounded-lg transition-colors ${isSubtask
              ? 'bg-slate-600 text-white hover:bg-slate-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {t("Edit")}
          </button>
        )}
      </div>
    </div>
  );
};