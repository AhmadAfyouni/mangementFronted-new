import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import useTimeTicker from "@/hooks/useTimeTicker";
import { DailyTask } from "@/types/dashboard.type";
import { Pause, Play } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

interface TaskItemProps {
    task: DailyTask;
    onTaskStateChange: (taskId: string, isRunning: boolean) => void;
    isAnyTaskRunning: boolean;
    runningTaskId: string | null;
}

const DailyTasks: React.FC = () => {
    const { t } = useLanguage();
    const { useDailyTasks } = useDashboard();
    const { data: dailyTasks, isLoading, refetch } = useDailyTasks();
    const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

    // Memoize activeTasks to prevent it from changing on every render
    const activeTasks = useMemo(() => 
        dailyTasks?.filter(task => task.status !== "Completed") || []
    , [dailyTasks]);

    // Function to handle task state changes globally
    const handleTaskStateChange = useCallback((taskId: string, isRunning: boolean) => {
        if (isRunning) {
            setRunningTaskId(taskId);
        } else if (runningTaskId === taskId) {
            setRunningTaskId(null);
        }
    }, [runningTaskId]);

    // Check if any task is currently running
    const isAnyTaskRunning = runningTaskId !== null;

    // Initial check for any running tasks when component mounts
    useEffect(() => {
        const checkForRunningTasks = async () => {
            await refetch();
            const runningTask = activeTasks.find(task =>
                task.timeLogs &&
                task.timeLogs.length > 0 &&
                !task.timeLogs[task.timeLogs.length - 1].end
            );

            if (runningTask) {
                setRunningTaskId(runningTask.id);
            }
        };

        checkForRunningTasks();
    }, [activeTasks, refetch]);

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
                {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onTaskStateChange={handleTaskStateChange}
                            isAnyTaskRunning={isAnyTaskRunning}
                            runningTaskId={runningTaskId}
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

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onTaskStateChange,
    isAnyTaskRunning,
    runningTaskId
}) => {
    const { t } = useLanguage();
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const {
        elapsedTime,
        isTaskRunning,
        startTaskTicker,
        pauseTaskTicker,
        isMakingAPICall
    } = useTimeTicker(task.id, task.timeLogs || []);

    const formatElapsedTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} h`;
    };

    // Sync local state with the time ticker state
    useEffect(() => {
        // Update the parent component about this task's running state
        // This ensures that the parent knows if a task is already running when the component mounts
        if (isTaskRunning) {
            onTaskStateChange(task.id, true);
        }

        // Update the paused state
        setIsPaused(!isTaskRunning && elapsedTime > 0);
    }, [isTaskRunning, elapsedTime, task.id, onTaskStateChange]);

    // Check if this task is allowed to start (only if no other task is running or this is the running task)
    const canStart = !isAnyTaskRunning || runningTaskId === task.id;

    const handleStartTask = async () => {
        if (isMakingAPICall || !canStart) return;
        try {
            await startTaskTicker();
            onTaskStateChange(task.id, true);
        } catch (error) {
            console.error("Error starting task:", error);
        }
    };

    const handlePauseTask = async () => {
        if (isMakingAPICall) return;
        try {
            await pauseTaskTicker();
            onTaskStateChange(task.id, false);
        } catch (error) {
            console.error("Error pausing task:", error);
        }
    };

    // Determine button text and state based on task status
    const getButtonText = () => {
        if (isTaskRunning) return t('out');
        if (!canStart) return t('wait'); // Show "wait" when another task is running
        return t('in');
    };

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

    return (
        <div className={`flex items-center bg-main rounded-xl py-4 px-2 transition-colors ${
            isTaskRunning ? "ring-2 ring-primary ring-opacity-50" : ""
        } ${getColorClass()}`}>
            {/* Task details */}
            <div className="flex-1 px-3">
                <h3 className="text-base font-medium text-twhite">{task.name}</h3>
                <div className="flex items-center">
                    <p className="text-sm text-tmid mr-2">
                        {formatElapsedTime(elapsedTime)}
                    </p>
                    {isTaskRunning && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {t('running')}
                        </span>
                    )}
                </div>
            </div>

            {/* Action buttons based on task state */}
            <div className="flex items-center gap-2">
                {(isTaskRunning || isPaused) && (
                    <button
                        onClick={isTaskRunning ? handlePauseTask : handleStartTask}
                        disabled={isMakingAPICall || (isPaused && !canStart)}
                        className={`p-2 rounded-full shadow transition-colors ${
                            isMakingAPICall || (isPaused && !canStart)
                                ? "bg-dark text-tdark cursor-not-allowed"
                                : "bg-secondary hover:bg-dark text-icons"
                        }`}
                        title={isTaskRunning ? t('pause') : t('resume')}
                    >
                        {isTaskRunning ? (
                            <Pause size={18} />
                        ) : (
                            <Play size={18} />
                        )}
                    </button>
                )}

                <button
                    onClick={isTaskRunning ? handlePauseTask : handleStartTask}
                    disabled={isMakingAPICall || (!isTaskRunning && !canStart)}
                    className={`px-4 py-2 rounded-full shadow text-base transition-colors ${
                        isMakingAPICall || (!isTaskRunning && !canStart && isAnyTaskRunning)
                            ? "bg-dark text-tdark cursor-not-allowed"
                            : isTaskRunning
                                ? "bg-danger hover:bg-danger/80 text-twhite"
                                : "bg-primary hover:bg-primary/80 text-twhite"
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export default DailyTasks;