import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import useTimeTicker from "@/hooks/useTimeTicker";
import { DailyTask } from "@/types/dashboard.type";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskItemProps {
    task: DailyTask;
}

const DailyTasks: React.FC = () => {
    const { t } = useLanguage();
    const { useDailyTasks } = useDashboard();
    const { data: dailyTasks, isLoading } = useDailyTasks();

    // Filter out completed tasks
    const activeTasks = dailyTasks?.filter(task => task.status !== "Completed") || [];

    // Render loading state if data is loading
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
                        <TaskItem key={task.id} task={task} />
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

// Separate TaskItem component to handle individual task timer logic
const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
    const { t } = useLanguage();
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    // Initialize the timer with task data
    const {
        elapsedTime,
        isTaskRunning,
        startTaskTicker,
        pauseTaskTicker,
        isMakingAPICall
    } = useTimeTicker(task.id, task.timeLogs || []);

    // Format elapsed time to display as HH:MM:SS h
    const formatElapsedTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} h`;
    };

    // Sync component state with the timer hook
    useEffect(() => {
        setIsRunning(isTaskRunning);
        setIsPaused(!isTaskRunning && elapsedTime > 0);
    }, [isTaskRunning, elapsedTime]);

    // Handle In/Out button click
    const handleInOutClick = async () => {
        if (isMakingAPICall) return;

        if (isRunning) {
            await pauseTaskTicker();
        } else {
            await startTaskTicker();
        }
    };

    // Handle Pause/Play button click
    const handlePausePlayClick = async () => {
        if (isMakingAPICall) return;

        if (isRunning) {
            await pauseTaskTicker();
        } else {
            await startTaskTicker();
        }
    };

    return (
        <div className="flex items-center bg-main rounded-xl py-4 ltr:pr-4 rtl:pl-4">
            {/* Color indicator - using the priority to determine color */}
            <div className={`w-1 h-8 ${getPriorityColorClass(task.priority)} rounded-full mx-4`}></div>

            {/* Task details */}
            <div className="flex-1">
                <h3 className="text-base font-medium text-twhite">{task.name}</h3>
                <p className="text-sm text-tmid">
                    {formatElapsedTime(elapsedTime)}
                </p>
            </div>

            {/* Action buttons based on task state */}
            <div className="flex items-center gap-2">
                {(isRunning || isPaused) && (
                    <button
                        onClick={handlePausePlayClick}
                        disabled={isMakingAPICall}
                        className="p-2 bg-secondary rounded-full shadow hover:bg-dark transition-colors"
                    >
                        {isRunning ? (
                            <Pause size={18} className="text-icons" />
                        ) : (
                            <Play size={18} className="text-icons" />
                        )}
                    </button>
                )}

                <button
                    onClick={handleInOutClick}
                    disabled={isMakingAPICall}
                    className="px-6 py-3 bg-secondary hover:bg-dark rounded-full shadow text-base text-twhite transition-colors w-24 text-center"
                >
                    {isRunning || isPaused ? t('out') : t('in')}
                </button>
            </div>
        </div>
    );
};

const getPriorityColorClass = (priority: string | undefined): string => {
    switch (priority?.toLowerCase()) {
        case 'high':
            return 'bg-danger'; // Use theme danger color for high priority
        case 'medium':
            return 'bg-primary'; // Use theme primary color for medium priority
        case 'low':
            return 'bg-warning'; // Use theme warning color for low priority
        default:
            return 'bg-dark';
    }
};

export default DailyTasks;