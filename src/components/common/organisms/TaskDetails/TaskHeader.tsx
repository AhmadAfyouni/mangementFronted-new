import useLanguage from "@/hooks/useLanguage";
import { formatDate, getPriorityColor } from "@/services/task.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { AlertCircle, Check, Clock, Edit2, X } from "lucide-react";
import { useState } from "react";

interface TaskHeaderProps {
  task: ReceiveTaskType;
  onUpdate: () => void;
  taskName: string;
  onNameChange: (name: string) => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onUpdate, taskName, onNameChange }) => {
  const { t, currentLanguage } = useLanguage();
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
              <h1 className="text-3xl font-bold text-twhite">
                {taskName || 'Untitled Task'}
              </h1>
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Save Changes")}
          </button>
        )}
      </div>
    </div>
  );
};
