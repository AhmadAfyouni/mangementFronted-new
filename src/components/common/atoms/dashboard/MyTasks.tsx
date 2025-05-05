import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import { MyTask } from "@/types/dashboard.type";
import { FileIcon, Inbox, MessageSquare, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const MyTasks: React.FC = () => {
    const { t } = useLanguage();
    type TaskStatus = "all" | MyTask['status'];

    const [activeFilter, setActiveFilter] = useState<TaskStatus>('all');

    const { useMyTasks } = useDashboard();
    const { data: myTasks, isLoading: isLoadingMyTasks } = useMyTasks();

    // Filter options
    const filters: TaskStatus[] = ['all', 'PENDING', 'ONGOING', 'DONE'];

    // Function to get status badge color
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'DONE':
                return 'bg-green-100 text-green-800';
            case 'ONGOING':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to get progress bar color
    const getProgressColor = (status: string): string => {
        switch (status) {
            case 'DONE':
                return 'bg-green-400';
            case 'ONGOING':
                return 'bg-amber-400';
            default:
                return 'bg-gray-400';
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

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
                {customMessage || t('no_tasks_found')}
            </h3>
            <p className="text-sm text-gray-500">
                {isLoadingMyTasks
                    ? t('loading_tasks')
                    : hasTasksButEmptyFilter
                        ? t('try_different_filter')
                        : t('no_tasks_message')
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
                            ? t('no_tasks_match_filter')
                            : t('no_tasks_available')
                    )}
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite">{t('my_tasks')}</h2>
                {myTasks && myTasks.length > 5 && (
                    <div className="mt-6 text-center">
                        <button className="text-sm text-tmid font-medium transition-colors">
                            {t('view_all_tasks')}
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
                                    {t('task')}
                                </th>
                                <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                    {t('status')}
                                </th>
                                <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider">
                                    {t('progress')}
                                </th>
                                <th scope="col" className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-twhite uppercase tracking-wider ltr:rounded-tr-xl  rtl:rounded-tl-xl">
                                    {t('activity')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-main divide-y divide-secondary">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task, index) => (
                                    <tr
                                        key={task.id}
                                        className={` hover:bg-dark ${index === filteredTasks.length - 1 ? 'rounded-b-xl  overflow-hidden' : ''
                                            }`}
                                    >
                                        <td className={`px-6 py-4 ${index === filteredTasks.length - 1 ? 'ltr:rounded-bl-xl rtl:rounded-br-xl' : ''
                                            }`}>
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
                                            <div className="flex items-center">
                                                <div className="w-32 bg-gray-300 rounded-full h-2 mx-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(task.status)}`}
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs  text-twhite">{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${index === filteredTasks.length - 1 ? 'ltr:rounded-br-xl rtl:rounded-bl-xl' : ''
                                            }`}>
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
                                ))
                            ) : (
                                renderPlaceholderRows()
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View all button - only show if there are tasks */}

        </div>
    );
};

export default MyTasks;