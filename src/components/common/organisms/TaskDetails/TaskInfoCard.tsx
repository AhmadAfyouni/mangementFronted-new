import { User, Building2, Target, AlertCircle, Calendar, FileText, ChevronDown, Edit2, Layers, ArrowUpRight, Clock, BarChart, Repeat, Briefcase, Tag, HashIcon } from "lucide-react";
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
  isEditing: boolean;
}

// Format time in hours and minutes
const formatTime = (seconds: number): string => {
  if (!seconds) return "0h 0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  }
  return `${minutes}m`;
};

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
  isEditing,
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

  // Function to get task type display
  const getTaskTypeDisplay = () => {
    if (task.isRoutineTask) {
      return { text: 'Routine Task', bgColor: 'bg-cyan-500/20 text-cyan-400' };
    }
    if (task.isRecurring) {
      return { text: 'Recurring Task', bgColor: 'bg-indigo-500/20 text-indigo-400' };
    }
    if (isSubtask) {
      return { text: 'Subtask', bgColor: 'bg-purple-500/20 text-purple-400' };
    }
    if ((task.subtasks?.length || 0) > 0) {
      return { text: 'Parent Task', bgColor: 'bg-orange-500/20 text-orange-400' };
    }
    return { text: 'Regular Task', bgColor: 'bg-blue-500/20 text-blue-400' };
  };

  // Get task type display
  const taskTypeInfo = getTaskTypeDisplay();

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
              {t("Subtask")}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Main Info */}
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

          {/* Task Type */}
          <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">{t("Task Type")}</span>
            </div>
            <span className={`px-3 py-1 rounded-full ${taskTypeInfo.bgColor}`}>
              {taskTypeInfo.text}
            </span>
          </div>

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

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-dark rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">{t("Status")}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => isEditing && setStatusMenuOpen(!isStatusMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${getStatusColor(selectedStatus || task.status)} ${isEditing
                  ? 'hover:bg-opacity-50 cursor-pointer hover:scale-105 border border-transparent hover:border-current'
                  : 'cursor-default'
                  }`}
              >
                {t(selectedStatus || task.status)}
                {isEditing && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''
                    }`} />
                )}
              </button>

              {isEditing && isStatusMenuOpen && (
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
                onClick={() => isEditing && setPriorityMenuOpen(!isPriorityMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${getPriorityColor(selectedPriority || task.priority)} ${isEditing
                  ? 'hover:bg-opacity-50 cursor-pointer hover:scale-105 border border-transparent hover:border-current'
                  : 'cursor-default'
                  }`}
              >
                {t(selectedPriority || task.priority)}
                {isEditing && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isPriorityMenuOpen ? 'rotate-180' : ''
                    }`} />
                )}
              </button>

              {isEditing && isPriorityMenuOpen && (
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

          {/* Progress */}
          <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">{t("Progress")}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className="text-blue-400 font-medium">{Math.round(task.progress)}%</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {t("Calculation")}: {task.progressCalculationMethod === 'time_based' ? t('Time Based') : t('Date Based')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Time Tracking Section */}
          <div className="p-4 bg-dark rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-blue-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("Time Tracking")}
            </h3>
            <div className="space-y-3">
              {/* Total Time Spent */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t("Total Time Spent")}:</span>
                <span className="text-twhite font-medium">{formatTime(task.totalTimeSpent)}</span>
              </div>

              {/* Estimated vs Actual Hours */}
              {task.estimated_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Estimated Hours")}:</span>
                  <span className="text-twhite">{task.estimated_hours}h</span>
                </div>
              )}

              {task.actual_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Actual Hours")}:</span>
                  <span className="text-twhite">{task.actual_hours}h</span>
                </div>
              )}

              {/* Time Efficiency */}
              {task.estimated_hours && task.actual_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Time Efficiency")}:</span>
                  <span className={`font-medium ${task.estimated_hours >= task.actual_hours ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round((task.estimated_hours / task.actual_hours) * 100)}%
                  </span>
                </div>
              )}

              {/* Running Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t("Status")}:</span>
                {task.startTime && !task.timeLogs?.[task.timeLogs?.length - 1]?.end ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {t("Running")}
                  </span>
                ) : (
                  <span className="text-gray-400">{t("Stopped")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="p-4 bg-dark rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-purple-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("Dates")}
            </h3>
            <div className="space-y-3">
              {/* Created Date */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t("Created")}:</span>
                <span className="text-twhite">{formatDate(task.createdAt, currentLanguage as "ar" | "en")}</span>
              </div>

              {/* Start Date */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t("Start Date")}:</span>
                <span className="text-twhite">{formatDate(task.start_date, currentLanguage as "ar" | "en")}</span>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{t("Due Date")}:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => isEditing && calRef.current?.showPicker()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${task.is_over_due ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      } ${isEditing ? 'hover:bg-opacity-50 hover:scale-105 cursor-pointer border border-transparent hover:border-current' : 'cursor-default'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    {formatDate(due_date || task.due_date, currentLanguage as "ar" | "en")}
                    {isEditing && <Edit2 className="w-3 h-3 ml-1 opacity-60" />}
                  </button>
                  <input
                    ref={calRef}
                    type="date"
                    value={due_date || task.due_date}
                    onChange={(e) => onDueDateChange(e.target.value)}
                    className="absolute opacity-0 pointer-events-none"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Expected End Date */}
              {task.expected_end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Expected End")}:</span>
                  <span className="text-twhite">{formatDate(task.expected_end_date, currentLanguage as "ar" | "en")}</span>
                </div>
              )}

              {/* Actual End Date */}
              {task.actual_end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Actual End")}:</span>
                  <span className="text-twhite">{formatDate(task.actual_end_date, currentLanguage as "ar" | "en")}</span>
                </div>
              )}

              {/* Days Until Due */}
              {task.status !== "DONE" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Days Until Due")}:</span>
                  <span className={`${task.is_over_due ? 'text-red-400' : 'text-green-400'}`}>
                    {task.is_over_due
                      ? t("Overdue by {{days}} days", { days: Math.abs(Math.ceil((new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24))) })
                      : t("{{days}} days left", { days: Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recurring Task Information */}
          {task.isRecurring && (
            <div className="p-4 bg-dark rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium text-indigo-400 mb-3 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                {t("Recurring Settings")}
              </h3>
              <div className="space-y-3">
                {/* Recurring Type */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Recurring Type")}:</span>
                  <span className="text-twhite capitalize">{task.recurringType}</span>
                </div>

                {/* Interval */}
                {task.intervalInDays && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{t("Interval")}:</span>
                    <span className="text-twhite">{task.intervalInDays} {t("days")}</span>
                  </div>
                )}

                {/* End Date */}
                {task.recurringEndDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{t("Recurrence End")}:</span>
                    <span className="text-twhite">{formatDate(task.recurringEndDate, currentLanguage as "ar" | "en")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Info */}
          <div className="p-4 bg-dark rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-amber-400 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t("Organization")}
            </h3>
            <div className="space-y-3">
              {/* Department */}
              {departmentName && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{t("Department")}:</span>
                  </div>
                  <span className="text-twhite">{departmentName}</span>
                </div>
              )}

              {/* Section */}
              {task.section && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Section")}:</span>
                  <span className="text-twhite">{task.section.name}</span>
                </div>
              )}

              {/* Project */}
              {task.project && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t("Project")}:</span>
                  <span className="text-twhite">{task.project.name}</span>
                </div>
              )}

              {/* Task ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HashIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{t("Task ID")}:</span>
                </div>
                <span className="text-gray-400 text-sm font-mono">{task.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
