import useLanguage from "@/hooks/useLanguage";
import { formatDate, getPriorityColor } from "@/services/task.service";
import { ReceiveTaskType } from "@/types/Task.type";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit2,
  Layers,
  PlayCircle,
  Repeat,
  Tag,
  Target,
  TestTube,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

interface TaskInfoCardProps {
  task: ReceiveTaskType;
  selectedStatus?: string;
  selectedPriority?: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string;
  expected_end_date?: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: "LOW" | "MEDIUM" | "HIGH") => void;
  onDueDateChange: (date: string) => void;
  onExpectedEndDateChange: (date: string) => void;
  isStatusMenuOpen: boolean;
  isPriorityMenuOpen: boolean;
  setStatusMenuOpen: (open: boolean) => void;
  setPriorityMenuOpen: (open: boolean) => void;
  allTasks?: ReceiveTaskType[];
  isEditing: boolean;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  ONGOING: { icon: PlayCircle, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ON_TEST: { icon: TestTube, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  DONE: { icon: CheckCircle2, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  CLOSED: { icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  CANCELED: { icon: XCircle, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
};

export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  task,
  selectedStatus,
  selectedPriority,
  due_date,
  expected_end_date,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onExpectedEndDateChange,
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
  const dueDateRef = useRef<HTMLInputElement>(null);
  const expectedEndDateRef = useRef<HTMLInputElement>(null);

  // Get current user and task assignee for permission checks
  const currentTaskStatus = selectedStatus || task.status;
  const currentUser = useSelector((state: RootState) => state.user.userInfo);
  const taskAssignee = task.assignee;

  // Check if current user is the assignee
  const isAssignee = currentUser?.id === taskAssignee?.id;

  // Status options based on current status and user permissions
  const getStatusOptions = () => {
    if (currentTaskStatus === "ON_TEST" && isAssignee) {
      return ["ONGOING", "DONE", "CLOSED", "CANCELED"];
    }
    return ["PENDING", "ONGOING", "ON_TEST"];
  };

  const statusOptions = getStatusOptions();
  const priorityOptions: ("LOW" | "MEDIUM" | "HIGH")[] = ["LOW", "MEDIUM", "HIGH"];

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    setStatusMenuOpen(false);
  };

  const assignee = task.assignee || task.emp;
  const assigneeName = assignee?.name || "";
  const assigneeDepartment = assignee?.department || task.department;
  const departmentName = assigneeDepartment?.name || "";

  const isSubtask = !!task.parent_task;
  const parentTask = isSubtask && allTasks && Array.isArray(allTasks) ? allTasks.find(t => t.id === task.parent_task) : null;

  const getTaskTypeInfo = () => {
    if (task.isRoutineTask) {
      return { text: t('Routine Task'), color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    }
    if (task.isRecurring) {
      return { text: t('Recurring Task'), color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
    }
    if (isSubtask) {
      return { text: t('Subtask'), color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
    if ((task.subtasks?.length || 0) > 0) {
      return { text: t('Parent Task'), color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    }
    return { text: t('Regular Task'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  };

  const formatDateSafely = (date: string | undefined | null): string => {
    return date ? formatDate(date, currentLanguage as "ar" | "en") : t("Not set");
  };

  // Helper to format seconds as HH:MM:SS
  const formatSecondsToHMS = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const taskTypeInfo = getTaskTypeInfo();

  const showPriority = useTasksGuard(["enablePriority"]);
  const showDueDate = useTasksGuard(["enableDueDate"]);

  return (
    <div className="space-y-4">
      {/* Parent Task Reference - Compact */}
      {isSubtask && parentTask && (
        <div className="p-3 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-lg border border-slate-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">{t("Parent Task")}</span>
            </div>
            <button
              onClick={() => router.push(`/tasks/${parentTask.id}`)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <span className="font-medium truncate max-w-[200px]">{parentTask.name}</span>
              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Column - Core Info */}
        <div className="space-y-4">
          {/* Task Overview */}
          <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              {t("Overview")}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("Type")}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${taskTypeInfo.color}`}>
                  {taskTypeInfo.text}
                </span>
              </div>

              {assignee && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Assignee")}</span>
                  <span className="text-white text-xs font-medium truncate max-w-[120px]">{assigneeName}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("progress")}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-blue-400 font-semibold text-xs">{Math.round(task.progress)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Info */}
          {departmentName && (
            <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                {t("Organization")}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Department")}</span>
                  <span className="text-white text-xs font-medium truncate max-w-[120px]">{departmentName}</span>
                </div>

                {task.section && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{t("Section")}</span>
                    <span className="text-white text-xs font-medium truncate max-w-[120px]">{task.section.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Status & Priority */}
        <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            {t("Status & Priority")}
          </h3>

          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{t("Status")}</span>
              <div className="relative">
                <button
                  onClick={() => isEditing && setStatusMenuOpen(!isStatusMenuOpen)}
                  disabled={!isEditing}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border transition-all ${getStatusConfig(selectedStatus || task.status).color} ${!isEditing ? 'cursor-default opacity-60' : 'hover:scale-105'}`}
                >
                  {t(selectedStatus || task.status)}
                  {isEditing && <ChevronDown className={`w-3 h-3 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />}
                </button>

                {isEditing && isStatusMenuOpen && !["DONE", "CLOSED", "CANCELED"].includes(selectedStatus || task.status) && (
                  <div className={`absolute top-full mt-1 ${isRTL ? 'left-0' : 'right-0'} bg-dark rounded-lg shadow-2xl border border-gray-700 p-1 z-50 min-w-[140px]`}>
                    {statusOptions.map((option) => {
                      const config = getStatusConfig(option);
                      const Icon = config.icon;
                      return (
                        <button
                          key={option}
                          onClick={() => handleStatusChange(option)}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 text-white transition-all text-xs"
                        >
                          <Icon className="w-3 h-3" />
                          {t(option)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            {showPriority && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("Priority")}</span>
                <div className="relative">
                  <button
                    onClick={() => isEditing && setPriorityMenuOpen(!isPriorityMenuOpen)}
                    disabled={!isEditing}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${getPriorityColor(selectedPriority || task.priority)} ${!isEditing ? 'cursor-default opacity-60' : 'hover:scale-105'}`}
                  >
                    {t(selectedPriority || task.priority)}
                    {isEditing && <ChevronDown className={`w-3 h-3 transition-transform ${isPriorityMenuOpen ? 'rotate-180' : ''}`} />}
                  </button>

                  {isEditing && isPriorityMenuOpen && (
                    <div className={`absolute top-full mt-1 ${isRTL ? 'left-0' : 'right-0'} bg-dark rounded-lg shadow-2xl border border-gray-700 p-1 z-50 min-w-[120px]`}>
                      {priorityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            onPriorityChange(option);
                            setPriorityMenuOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 text-white transition-all text-xs"
                        >
                          {t(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rating Requirement */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{t("Requires Rating")}</span>
              <div className={`px-2 py-1 rounded text-xs font-medium border ${task.requiresRating
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                {task.requiresRating ? t("Yes") : t("No")}
              </div>
            </div>

            {/* Task ID */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{t("Task ID")}</span>
              <span className="text-gray-400 text-xs font-mono">{task.id.slice(-8)}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Dates */}
        <div className="flex flex-col gap-2">
          <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              {t("Timeline")}
            </h3>
            <div className="space-y-3">
              {/* Start Date */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("Start")}</span>
                <span className="text-white text-xs">{formatDate(task.start_date, currentLanguage as "ar" | "en")}</span>
              </div>
              {/* Due Date */}
              {showDueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Due")}</span>
                  <button
                    onClick={() => isEditing && dueDateRef.current?.showPicker()}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all ${task.is_over_due
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                      } ${isEditing ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                  >
                    {formatDateSafely(due_date)}
                    {isEditing && <Edit2 className="w-2 h-2 opacity-60" />}
                  </button>
                  <input
                    ref={dueDateRef}
                    type="date"
                    value={due_date}
                    onChange={(e) => onDueDateChange(e.target.value)}
                    className="absolute opacity-0 pointer-events-none"
                    disabled={!isEditing}
                  />
                </div>
              )}
              {/* Expected End */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t("Expected")}</span>
                <button
                  onClick={() => isEditing && expectedEndDateRef.current?.showPicker()}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all bg-blue-500/20 text-blue-400 border-blue-500/30 ${isEditing ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                    }`}
                >
                  {formatDateSafely(expected_end_date)}
                  {isEditing && <Edit2 className="w-2 h-2 opacity-60" />}
                </button>
                <input
                  ref={expectedEndDateRef}
                  type="date"
                  value={expected_end_date}
                  onChange={(e) => onExpectedEndDateChange(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                  disabled={!isEditing}
                />
              </div>
              {/* Actual End (if completed) */}
              {task.actual_end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Completed")}</span>
                  <span className="text-green-400 text-xs">{formatDate(task.actual_end_date, currentLanguage as "ar" | "en")}</span>
                </div>
              )}
            </div>
          </div>
          {/* Actual Hours / Rating / Comment */}
          {["DONE", "CLOSED", "CANCELED"].includes(task.status) && (
            <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                {t("Actual Hours & Rating")}
              </h3>
              <div className="space-y-3">
                {/* Estimated Hours */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Estimated Hours")}</span>
                  <span className="text-white text-xs font-mono">
                    {task.estimated_hours !== undefined && task.estimated_hours !== null
                      ? `${task.estimated_hours} ${t("hours")}`
                      : t("Not set")}
                  </span>
                </div>
                {/* Actual Hours/Time */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t("Actual Time")}</span>
                  <span className="text-white text-xs font-mono">
                    {task.actual_hours !== undefined && task.actual_hours !== null
                      ? formatSecondsToHMS(task.actual_hours)
                      : task.totalTimeSpent
                        ? new Date(task.totalTimeSpent * 1000).toISOString().substr(11, 8)
                        : t("Not set")}
                  </span>
                </div>
                {/* Rating */}
                {task.requiresRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{t("Rating")}</span>
                    <span className="text-yellow-400 text-xs font-semibold">
                      {task.rate !== undefined && task.rate !== null
                        ? `${task.rate} / 5`
                        : t("Not rated")}
                    </span>
                  </div>
                )}
                {/* Comment (if requiresRating) */}
                {task.requiresRating && (
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-gray-400 mt-0.5">{t("Comment")}</span>
                    <span className="text-white text-xs max-w-xs text-right break-words">
                      {task.comment ? task.comment : t("No comment")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Information - Compact */}
      {task.isRecurring && (
        <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-400" />
            {t("Recurring Settings")}
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{t("Type")}</div>
              <div className="text-white text-xs font-medium capitalize">{task.recurringType}</div>
            </div>

            {task.intervalInDays && (
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">{t("Interval")}</div>
                <div className="text-white text-xs font-medium">{task.intervalInDays} {t("days")}</div>
              </div>
            )}

            {task.recurringEndDate && (
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">{t("End Date")}</div>
                <div className="text-white text-xs font-medium">{formatDate(task.recurringEndDate, currentLanguage as "ar" | "en")}</div>
              </div>
            )}

            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{t("Status")}</div>
              <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs font-medium border border-indigo-500/30">
                {t("Active")}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};