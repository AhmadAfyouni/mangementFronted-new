import { User, Building2, Target, AlertCircle, Calendar, FileText, ChevronDown, Edit2 } from "lucide-react";
import { ReceiveTaskType } from "@/types/Task.type";
import { formatDate, getPriorityColor } from "@/services/task.service";
import useLanguage from "@/hooks/useLanguage";
import { useRef } from "react";

interface TaskInfoCardProps {
  task: ReceiveTaskType;
  selectedStatus?: string;
  selectedPriority?: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: "LOW" | "MEDIUM" | "HIGH") => void;
  onDueDateChange: (date: string) => void;
  isStatusMenuOpen: boolean;
  isPriorityMenuOpen: boolean;
  setStatusMenuOpen: (open: boolean) => void;
  setPriorityMenuOpen: (open: boolean) => void;
}

export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  task,
  selectedStatus,
  selectedPriority,
  due_date,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  isStatusMenuOpen,
  isPriorityMenuOpen,
  setStatusMenuOpen,
  setPriorityMenuOpen,
}) => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const calRef = useRef<HTMLInputElement>(null);

  const statusOptions = ["PENDING", "ONGOING", "ON_TEST", "DONE"];
  const priorityOptions: ("LOW" | "MEDIUM" | "HIGH")[] = ["LOW", "MEDIUM", "HIGH"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE": return "bg-green-500/20 text-green-400";
      case "ONGOING": return "bg-blue-500/20 text-blue-400";
      case "ON_TEST": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Extract assignee data - handle both task.assignee and task.emp structures
  const assignee = task.assignee || task.emp;
  const assigneeName = assignee?.name || "";
  const assigneeDepartment = assignee?.department || task.department;
  const departmentName = assigneeDepartment?.name || "";

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        {t("Task Information")}
      </h2>

      <div className="space-y-4">
        {/* Assignee */}
        {assignee && (
          <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">{t("Assignee")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {assigneeName.charAt(0).toUpperCase()}
              </div>
              <span className="text-twhite">{assigneeName}</span>
            </div>
          </div>
        )}

        {/* Department */}
        {departmentName && (
          <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">{t("Department")}</span>
            </div>
            <span className="text-twhite">{departmentName}</span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-dark rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">{t("Status")}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setStatusMenuOpen(!isStatusMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${getStatusColor(selectedStatus || task.status)} ${'hover:bg-opacity-50 cursor-pointer hover:scale-105 border border-transparent hover:border-current'

                }`}
            >
              {t(selectedStatus || task.status)}
              {(
                <ChevronDown className={`w-4 h-4 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''
                  }`} />
              )}
            </button>

            {isStatusMenuOpen && (
              <div className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} bg-dark rounded-lg shadow-xl p-2 z-10 min-w-[150px]`}>
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onStatusChange(option);
                      setStatusMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-twhite transition-colors"
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between p-4 bg-dark rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">{t("Priority")}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setPriorityMenuOpen(!isPriorityMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${getPriorityColor(selectedPriority || task.priority)} ${'hover:bg-opacity-50 cursor-pointer hover:scale-105 border border-transparent hover:border-current'

                }`}
            >
              {t(selectedPriority || task.priority)}
              {(
                <ChevronDown className={`w-4 h-4 transition-transform ${isPriorityMenuOpen ? 'rotate-180' : ''
                  }`} />
              )}
            </button>

            {isPriorityMenuOpen && (
              <div className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} bg-dark rounded-lg shadow-xl p-2 z-10 min-w-[150px]`}>
                {priorityOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onPriorityChange(option);
                      setPriorityMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-twhite transition-colors"
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between p-4 bg-dark rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">{t("Due Date")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => calRef.current?.showPicker()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${task.is_over_due ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                } hover:bg-opacity-50 hover:scale-105 cursor-pointer border border-transparent hover:border-current`}
            >
              <Calendar className="w-4 h-4" />
              {formatDate(due_date || task.due_date, currentLanguage as "ar" | "en")}
              <Edit2 className="w-3 h-3 ml-1 opacity-60" />
            </button>
            <input
              ref={calRef}
              type="date"
              value={due_date || task.due_date}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="absolute opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
