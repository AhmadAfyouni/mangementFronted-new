import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { MyTask } from "@/types/dashboard.type";
import { FileIcon, Inbox, MessageSquare, Clock } from "lucide-react";
import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { PlayIcon, PauseIcon } from "@/assets";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import PageSpinner from "../ui/PageSpinner";

const MyTasks: React.FC = () => {
    const { t } = useLanguage();
    type TaskStatus = "all" | MyTask['status'];

    const [activeFilter, setActiveFilter] = useState<TaskStatus>('all');

    const { useMyTasks } = useDashboard();
    const { data: myTasks, isLoading: isLoadingMyTasks, error } = useMyTasks();

    // Filter options
    const filters: TaskStatus[] = ['all', 'PENDING', 'ONGOING', 'DONE'];

    // Memoized functions to prevent re-renders
    const getStatusColor = useCallback((status: string): string => {
        switch (status) {
            case 'DONE':
                return 'bg-green-100 text-green-800';
            case 'ONGOING':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch {
            return '';
        }
    }, []);

    const formatTime = useCallback((totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    try {
        // Handle error state
        if (error) {
            return (
                <div className="bg-secondary rounded-xl shadow p-6 h-full">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-red-400 mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            Error loading tasks
                        </h3>
                        <p className="text-sm text-gray-500">
                            Please try again later
                        </p>
                    </div>
                </div>
            );
        }

        // Filter tasks based on active filter
        const filteredTasks = myTasks?.filter(
            (task) => activeFilter === 'all' || task.status === activeFilter
        ) || [];

        // Handle empty filtered tasks but with available filters
        const hasTasksButEmptyFilter = myTasks && myTasks.length > 0 && filteredTasks.length === 0;

        // Render empty state when no tasks or loading
        const renderEmptyState = (customMessage?: string) => (
            <div className="flex flex-col items-center justify-center py-12">
                <Inbox size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {customMessage || 'No tasks found'}
                </h3>
                <p className="text-sm text-gray-500">
                    {isLoadingMyTasks
                        ? 'Loading tasks...'
                        : hasTasksButEmptyFilter
                            ? 'Try a different filter'
                            : 'No tasks available'
                    }
                </p>
            </div>
        );

        // Create placeholder rows when filtered results are empty
        const renderPlaceholderRows = () => {
            return (
                <tr className="bg-main rounded-b-xl overflow-hidden">
                    <td colSpan={4} className="px-6 py-8 text-center rounded-b-xl">
                        {renderEmptyState(
                            hasTasksButEmptyFilter
                                ? 'No tasks match filter'
                                : 'No tasks available'
                        )}
                    </td>
                </tr>
            );
        };

        return (
            <div className="bg-secondary rounded-xl shadow p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-twhite">My Tasks</h2>
                    {myTasks && myTasks.length > 5 && (
                        <div className="mt-6 text-center">
                            <button className="text-sm text-tmid font-medium transition-colors">
                                View All
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                                ? 'bg-indigo-100 text-indigo-800 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Loading state */}
                {isLoadingMyTasks ? (
                    renderEmptyState()
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary">
                            <thead className="bg-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider ltr:rounded-tl-xl  rtl:rounded-tr-xl">
                                        Task
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                        Time Tracking
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider ltr:rounded-tr-xl  rtl:rounded-tl-xl">
                                        Activity
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-main divide-y divide-secondary">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task, index) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            isLast={index === filteredTasks.length - 1}
                                            formatDate={formatDate}
                                            getStatusColor={getStatusColor}
                                            formatTime={formatTime}
                                            t={t}
                                        />
                                    ))
                                ) : (
                                    renderPlaceholderRows()
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error in MyTasks component:", error);
        return (
            <div className="bg-secondary rounded-xl shadow p-6 h-full">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-red-400 mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Component Error
                    </h3>
                    <p className="text-sm text-gray-500">
                        Something went wrong. Please refresh the page.
                    </p>
                </div>
            </div>
        );
    }
};

// Memoized TaskRow component to prevent unnecessary re-renders
const TaskRow = memo<{
    task: MyTask;
    isLast: boolean;
    formatDate: (dateString: string) => string;
    getStatusColor: (status: string) => string;
    formatTime: (totalSeconds: number) => string;
    t: (key: string) => string;
}>(({ task, isLast, formatDate, getStatusColor, formatTime, t }) => {
    const { setSnackbarConfig } = useMokkBar();

    // Use useTaskTimer hook directly - hooks must be called unconditionally
    const {
        elapsedTime,
        isRunning,
        pauseTimer,
        startTimer,
        isLoading,
    } = useTaskTimer(task.id, task.timeLogs || []);

    return (
        <tr
            className={` hover:bg-dark ${isLast ? 'rounded-b-xl  overflow-hidden' : ''}`}
        >
            <td className={`px-6 py-4 ${isLast ? 'ltr:rounded-bl-xl rtl:rounded-br-xl' : ''}`}>
                <div className="flex flex-col text-twhite">
                    <div className="text-sm font-medium ">{task.name}</div>
                    <div className="text-xs ">
                        {formatDate(task.dueDate)} • {task.project}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`${getStatusColor(task.status)} text-xs px-2.5 py-0.5 rounded-full`}>
                    {task.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                    <div className="bg-secondary/30 px-3 py-1.5 rounded-lg shadow shadow-black/20 hover:bg-secondary/40 transition-all duration-300">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-gray-300">
                                    {formatTime(task?.timeSpent || 0)}
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

                    {task.status !== "DONE" && (
                        <div className="flex space-x-1">
                            {!isRunning ? (
                                <button
                                    disabled={isLoading}
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${!isLoading
                                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                                        : "bg-gray-700/40 text-gray-500 cursor-not-allowed"
                                        }`}
                                    onClick={async (e) => {
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
                                    }}
                                >
                                    <Image
                                        src={PlayIcon}
                                        alt="play icon"
                                        width={15}
                                        height={15}
                                    />
                                    <span className="text-sm font-medium">{t("Start")}</span>
                                </button>
                            ) : (
                                <button
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-md hover:shadow-red-500/10 flex items-center gap-1.5 transition-all duration-300"
                                    onClick={async (e) => {
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
                                    }}
                                >
                                    {isLoading ? (
                                        <PageSpinner size="small" />
                                    ) : (
                                        <>
                                            <Image
                                                src={PauseIcon}
                                                alt="pause icon"
                                                width={15}
                                                height={15}
                                            />
                                            <span className="text-sm font-medium">{t("Pause")}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap ${isLast ? 'ltr:rounded-br-xl rtl:rounded-bl-xl' : ''}`}>
                <div className="flex gap-4">
                    <div className="flex items-center  text-twhite">
                        <MessageSquare size={14} className="mx-1" />
                        <span className="text-xs">{task.commentsCount || 0}</span>
                    </div>
                    <div className="flex items-center  text-twhite">
                        <FileIcon size={14} className="mx-1" />
                        <span className="text-xs">{task.filesCount || 0}</span>
                    </div>
                </div>
            </td>
        </tr>
    );
});

TaskRow.displayName = 'TaskRow';

export default MyTasks;