import { useDashboard } from "@/hooks/useDashboard";
import { MyTask } from "@/types/dashboard.type";
import { FileIcon, Inbox, MessageSquare } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';

const MyTasks: React.FC = () => {
    const { t } = useTranslation();

    type TaskStatus = "all" | MyTask['status'];

    const [activeFilter, setActiveFilter] = useState<TaskStatus>('all');

    const { useMyTasks } = useDashboard();
    const { data: myTasks, isLoading: isLoadingMyTasks, error } = useMyTasks();

    // Filter options
    const filters: TaskStatus[] = ['all', 'PENDING', 'ONGOING', 'DONE', 'CLOSED', 'CANCELED'];

    // Memoized functions to prevent re-renders
    const getStatusColor = useCallback((status: string): string => {
        switch (status) {
            case 'DONE':
                return 'bg-green-100 text-green-800';
            case 'CLOSED':
                return 'bg-red-100 text-red-800';
            case 'CANCELED':
                return 'bg-purple-100 text-purple-800';
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

    try {
        // Handle error state
        if (error) {
            return (
                <div className="bg-secondary rounded-xl shadow p-6 h-full">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-red-400 mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            {t("Error loading tasks")}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t("Please try again later")}
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
                    {customMessage || t('No tasks found')}
                </h3>
                <p className="text-sm text-gray-500">
                    {isLoadingMyTasks
                        ? t('Loading tasks...')
                        : hasTasksButEmptyFilter
                            ? t('Try a different filter')
                            : t('No tasks available')
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
                                ? t('No tasks match filter')
                                : t('No tasks available')
                        )}
                    </td>
                </tr>
            );
        };

        return (
            <div className="bg-secondary rounded-xl shadow p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-twhite">{t("My Tasks")}</h2>
                    {myTasks && myTasks.length > 5 && (
                        <div className="mt-6 text-center">
                            <button className="text-sm text-tmid font-medium transition-colors">
                                {t("View All")}
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
                            {filter === 'all' ? t('all') : filter}
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
                                        {t("Task")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                        {t("Status")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                        {t("Progress")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider ltr:rounded-tr-xl  rtl:rounded-tl-xl">
                                        {t("Activity")}
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
                        {t("Component Error")}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t("Something went wrong. Please refresh the page.")}
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
}>(({ task, isLast, formatDate, getStatusColor }) => {
    const { t } = useTranslation();

    // Get progress color based on percentage
    const getProgressColor = (progress: number) => {
        if (progress >= 75) return "bg-green-500";
        if (progress >= 50) return "bg-blue-500";
        if (progress >= 25) return "bg-yellow-500";
        return "bg-red-500";
    };

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
                <div className="flex flex-col w-full gap-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{task.progress}%</span>
                        {task.status === "DONE" && (
                            <span className="text-xs text-green-400">{t("Completed")}</span>
                        )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${getProgressColor(task.progress)}`}
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
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