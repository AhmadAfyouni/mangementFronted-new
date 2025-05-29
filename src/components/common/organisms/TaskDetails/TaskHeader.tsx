import useLanguage from "@/hooks/useLanguage";
import { formatDate, getPriorityColor } from "@/services/task.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { AlertCircle, Check, Clock, Edit2, X, ArrowLeft, Layers } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskHeaderProps {
  task: ReceiveTaskType;
  onUpdate: () => void;
  taskName: string;
  onNameChange: (name: string) => void;
  allTasks?: ReceiveTaskType[];
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  onUpdate,
  taskName,
  onNameChange,
  allTasks
}) => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(taskName);

  const handleSaveName = () => {
    onNameChange(tempName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(taskName);
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Check if this is a subtask and get parent task info
  const isSubtask = !!task.parent_task;
  const parentTask = isSubtask && allTasks
    ? allTasks.find(t => t.id === task.parent_task)
    : null;

  const handleParentTaskClick = () => {
    if (parentTask) {
      router.push(`/tasks/${parentTask.id}`);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 text-twhite outline-none px-2"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              {/* Add subtask icon next to title */}
              <div className="flex items-center gap-3">
                {isSubtask && (
                  <div className="flex items-center gap-2">
                    {/* Hierarchy breadcrumb SVG */}
                    <div className="flex items-center gap-1">
                      <svg width="20" height="16" viewBox="0 0 20 16" className="text-slate-500">
                        <rect x="1" y="6" width="6" height="4" rx="1" fill="currentColor" className="opacity-40" />
                        <path d="M8 8 L12 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="opacity-60" />
                        <rect x="13" y="6" width="6" height="4" rx="1" fill="currentColor" className="opacity-80" />
                        <path d="M16 6 L16 2" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                        <circle cx="16" cy="1" r="1" fill="currentColor" className="opacity-60" />
                      </svg>
                    </div>

                    <div className="p-2 bg-slate-500/20 rounded-lg relative">
                      <Layers className="w-6 h-6 text-slate-400" />
                      {/* Small indicator dot */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 8 8" className="text-white">
                          <path d="M2 4 L3.5 5.5 L6 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <h1 className={`text-3xl font-bold ${isSubtask ? 'text-slate-200' : 'text-twhite'}`}>
                  {taskName || 'Untitled Task'}
                </h1>
              </div>
              {(
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-gray-400 hover:text-twhite hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
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

        {(
          <button
            onClick={onUpdate}
            className={`px-6 py-2 rounded-lg transition-colors ${isSubtask
              ? 'bg-slate-600 text-white hover:bg-slate-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {t("Save Changes")}
          </button>
        )}
      </div>
    </div>
  );
};
