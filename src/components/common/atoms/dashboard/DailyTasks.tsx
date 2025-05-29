import { useMokkBar } from "@/components/Providers/Mokkbar";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { ReceiveTaskType } from "@/types/Task.type";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageSpinner from "../ui/PageSpinner";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useRolePermissions } from "@/hooks/useCheckPermissions";

interface TaskItemProps {
    task: ReceiveTaskType;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const DailyTasks: React.FC = () => {
    const { t } = useLanguage();
    const isAdmin = useRolePermissions("admin");
    const isPrimary = useRolePermissions("primary_user");

    // Use the same query as the main tasks table
    const { data: tasksData, isLoading, refetch } = useCustomQuery<{
        info: ReceiveTaskType[];
        tree: any[];
    }>({
        queryKey: ["tasks", ""],
        url: `/tasks/tree?`,
    });

    // Get today's tasks (tasks due today or ongoing tasks)
    const dailyTasks = useMemo(() => {
        if (!tasksData?.info) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tasksData.info.filter(task => {
            // Include ongoing tasks or tasks due today
            if (task.status === "ONGOING") return true;

            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
            }

            return false;
        }).filter(task => task.status !== "DONE"); // Exclude completed tasks
    }, [tasksData?.info]);

    // Periodically refresh data to keep in sync with other components
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            refetch();
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(refreshInterval);
    }, [refetch]);

    if (isLoading) {
        return (
            <div className="bg-secondary rounded-xl shadow p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-twhite">{t('daily_tasks')}</h2>
                </div>
                <div className="flex justify-center items-center h-64">
                    <p className="text-tmid">{t('loading')}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite">{t('daily_tasks')}</h2>
                <button className="text-sm bg-main hover:bg-dark text-tmid px-4 py-2 rounded-lg border border-dark transition-colors">
                    {t('view_all')}
                </button>
            </div>

            <div className="space-y-4">
                {dailyTasks.length > 0 ? (
                    dailyTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                        />
                    ))
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-tmid">{t('no_daily_tasks')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
    const { t } = useLanguage();
    const { setSnackbarConfig } = useMokkBar();

    const {
        elapsedTime,
        isRunning,
        totalTimeSpent,
        startTimer,
        pauseTimer,
        isLoading,
    } = useTaskTimer(task.id, task.timeLogs || []);

    // Custom color for task item based on priority
    const getColorClass = () => {
        switch (task.priority?.toLowerCase()) {
            case 'high':
                return 'border-l-4 border-danger';
            case 'medium':
                return 'border-l-4 border-primary';
            case 'low':
                return 'border-l-4 border-warning';
            default:
                return 'border-l-4 border-dark';
        }
    };

    const handleStartTask = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (task?.status === "ONGOING") {
            try {
                const result = await startTimer();
                if (!result.success) {
                    setSnackbarConfig({
                        message: t("Failed to start the timer. Please try again."),
                        open: true,
                        severity: "error",
                    });
                }
            } catch (error) {
                console.error("Error starting timer:", error);
                setSnackbarConfig({
                    message: t("Failed to start the timer. Please try again."),
                    open: true,
                    severity: "error",
                });
            }
        } else {
            setSnackbarConfig({
                message: t("Task Status must be ONGOING"),
                open: true,
                severity: "warning",
            });
        }
    };

    const handlePauseTask = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const result = await pauseTimer();
            if (!result.success) {
                setSnackbarConfig({
                    message: t("Failed to pause the timer. Please try again."),
                    open: true,
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Error pausing timer:", error);
            setSnackbarConfig({
                message: t("Failed to pause the timer. Please try again."),
                open: true,
                severity: "error",
            });
        }
    };

    return (
        <div className={`flex items-center bg-main rounded-xl py-4 px-2 transition-colors ${isRunning ? "ring-2 ring-primary ring-opacity-50" : ""
            } ${getColorClass()}`}>
            {/* Task details */}
            <div className="flex-1 px-3">
                <h3 className="text-base font-medium text-twhite">{task.name}</h3>
                <div className="flex flex-col">
                    {/* Time tracking section - exactly like main tasks table */}
                    <div className="bg-secondary/30 px-3 py-1.5 rounded-lg shadow shadow-black/20 hover:bg-secondary/40 transition-all duration-300 mt-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-gray-300">
                                    {formatTime(task?.totalTimeSpent || totalTimeSpent)}
                                </span>
                            </div>
                            {isRunning && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot"></div>
                                    <span className="text-xs text-green-400">
                                        {formatTime(elapsedTime)} {t("running")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons - exactly like main tasks table */}
            <div className="flex items-center gap-2">
                {task?.status !== "DONE" && (
                    <div className="flex space-x-1">
                        {!isRunning ? (
                            <button
                                disabled={isLoading}
                                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${!isLoading
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                                    : "bg-gray-700/40 text-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={handleStartTask}
                            >
                                <span className="text-sm font-medium">{t("Start")}</span>
                            </button>
                        ) : (
                            <button
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-md hover:shadow-red-500/10 flex items-center gap-1.5 transition-all duration-300"
                                onClick={handlePauseTask}
                            >
                                {isLoading ? (
                                    <PageSpinner size="small" />
                                ) : (
                                    <span className="text-sm font-medium">{t("Pause")}</span>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {task?.status === "DONE" && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm border border-green-500/20 shadow-sm shadow-green-500/10 transition-all duration-300">
                        <span className="font-medium">{t("Completed")}</span>
                    </span>
                )}
            </div>
        </div>
    );
};

export default DailyTasks;