import { useMokkBar } from "@/components/Providers/Mokkbar";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { DailyTask } from "@/types/dashboard.type";
import { Clock } from "lucide-react";
import { useMemo, useState } from "react";

interface DailyTasksProps {
    dailyTasks: DailyTask[];
    isLoading: boolean;
}

interface TaskItemProps {
    task: DailyTask;
    onClick?: (task: DailyTask) => void;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const DailyTasks: React.FC<DailyTasksProps> = ({ dailyTasks, isLoading }) => {
    const { t } = useLanguage();
    const [scrollProgress, setScrollProgress] = useState(0);

    // Filter tasks to show only non-completed tasks
    const filteredDailyTasks = useMemo(() => {
        return dailyTasks.filter(task => task.status !== "DONE");
    }, [dailyTasks]);

    // Handle scroll to update progress
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
        setScrollProgress(progress);
    };

    if (isLoading) {
        return (
            <div className="bg-secondary rounded-xl shadow p-4 sm:p-6 h-full">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-twhite">{t('daily_tasks')}</h2>
                </div>
                <div className="flex justify-center items-center h-64">
                    <p className="text-tmid text-sm sm:text-base">{t('loading')}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary rounded-xl shadow p-4 sm:p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-twhite">{t('daily_tasks')}</h2>
                <button className="text-xs sm:text-sm bg-main hover:bg-dark text-tmid px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-dark transition-colors">
                    {t('view_all')}
                </button>
            </div>

            {/* Scrollable tasks container with fixed height to match calendar */}
            <div className="relative flex-1">
                {/* Scroll progress indicator */}
                {filteredDailyTasks.length > 5 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700/30 rounded-t-xl z-10">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl transition-all duration-300 ease-out scroll-indicator"
                            style={{ width: `${scrollProgress}%` }}
                        ></div>
                    </div>
                )}

                <div className="absolute inset-0 overflow-y-auto daily-tasks-scroll" onScroll={handleScroll}>
                    <div className="space-y-2 pr-1 sm:pr-2 pb-2">
                        {filteredDailyTasks.length > 5 && <div className="h-1"></div>} {/* Spacer for progress bar */}
                        {filteredDailyTasks.length > 0 ? (
                            filteredDailyTasks.map((task, index) => (
                                <div key={task.id} className="task-item-enter" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskItem
                                        task={task}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-tmid text-sm sm:text-base">{t('no_daily_tasks')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fade effect at bottom to indicate more content */}
                {filteredDailyTasks.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-secondary to-transparent pointer-events-none rounded-b-xl"></div>
                )}
            </div>

            {/* Hidden scrollbar styles for daily tasks */}
            <style jsx>{`
                .daily-tasks-scroll {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-behavior: smooth;
                }
                
                .daily-tasks-scroll::-webkit-scrollbar {
                    display: none;
                }
                
                /* Task item animation */
                .task-item-enter {
                    animation: slideInUp 0.3s ease-out forwards;
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Scroll indicator pulse animation */
                .scroll-indicator {
                    animation: pulse-glow 2s infinite;
                }
                
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 15px rgba(59, 130, 246, 0.8), 0 0 25px rgba(147, 51, 234, 0.4);
                    }
                }
            `}</style>
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
        <div className={`flex items-center bg-main rounded-lg py-2 sm:py-3 px-2 sm:px-3 transition-colors ${isRunning ? "ring-1 ring-primary ring-opacity-50" : ""
            } ${getColorClass()}`}>
            {/* Task details */}
            <div className="flex-1 px-1 sm:px-2 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-twhite truncate">{task.name}</h3>
                {/* Compact time tracking section */}
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-300">
                            {formatTime(task?.timeSpent || totalTimeSpent)}
                        </span>
                    </div>
                    {isRunning && (
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-dot"></div>
                            <span className="text-xs text-green-400">
                                {formatTime(elapsedTime)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact action buttons */}
            <div className="flex items-center ml-1 sm:ml-2">
                {task?.status !== "DONE" && (
                    <div className="flex">
                        {!isRunning ? (
                            <button
                                disabled={isLoading}
                                className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${!isLoading
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    : "bg-gray-700/40 text-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={handleStartTask}
                            >
                                {t("Start")}
                            </button>
                        ) : (
                            <button
                                className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                                onClick={handlePauseTask}
                            >
                                {isLoading ? "..." : t("Pause")}
                            </button>
                        )}
                    </div>
                )}

                {task?.status === "DONE" && (
                    <span className="px-2 sm:px-3 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/20">
                        {t("Completed")}
                    </span>
                )}
            </div>
        </div>
    );
};

export default DailyTasks;