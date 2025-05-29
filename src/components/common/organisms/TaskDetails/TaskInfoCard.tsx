import { User, Building2, Target, AlertCircle, Calendar, FileText, ChevronDown, Edit2, Layers, ArrowUpRight } from "lucide-react";
import { ReceiveTaskType } from "@/types/Task.type";
import { formatDate, getPriorityColor } from "@/services/task.service";
import useLanguage from "@/hooks/useLanguage";
import { useRef } from "react";
import { useRouter } from "next/navigation";

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
  allTasks?: ReceiveTaskType[];
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
  allTasks,
}) => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
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
    <div className={`rounded-xl p-6 border ${isSubtask
      ? 'bg-slate-500/5 border-slate-500/30 relative'
      : 'bg-secondary border-gray-700'
      }`}>
      {/* Subtask corner indicator */}
      {isSubtask && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-slate-400 opacity-60"></div>
      )}

      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        {t("Task Information")}
        {isSubtask && (
          <div className="flex items-center gap-2">
            <span className="text-sm bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full border border-slate-500/40">
              🔗 {t("Subtask")}
            </span>
            {/* Visual hierarchy indicator */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        )}
      </h2>

      <div className="space-y-4">
        {/* Parent Task - Only show for subtasks */}
        {isSubtask && parentTask && (
          <div className="relative p-4 bg-slate-500/10 border border-slate-500/30 rounded-lg">
            {/* Hierarchy indicator on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-l-lg"></div>

            <div className="relative z-10 ml-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Enhanced icon with indicator */}
                  <div className="relative">
                    <Layers className="w-5 h-5 text-slate-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                  </div>
                  <span className="text-slate-400 font-medium">
                    {t("Parent Task")}
                  </span>
                </div>
                <button
                  onClick={handleParentTaskClick}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-all duration-300 group hover:scale-105"
                >
                  <span className="font-medium group-hover:underline">
                    {parentTask.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span className={`px-2 py-1 rounded-full ${getStatusColor(parentTask.status)}`}>
                  {t(parentTask.status)}
                </span>
                <span className={`px-2 py-1 rounded-full ${getPriorityColor(parentTask.priority)}`}>
                  {t(parentTask.priority)}
                </span>

                {/* Visual separator with subtask indicator */}
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  <span className="text-xs text-slate-500 bg-slate-500/20 px-2 py-1 rounded-full">
                    {t("Subtask")} #{task.id.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
