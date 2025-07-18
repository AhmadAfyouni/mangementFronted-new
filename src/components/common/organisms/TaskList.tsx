import { useMokkBar } from "@/components/Providers/Mokkbar";
import useHierarchy from "@/hooks/useHierarchy";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { categorizeTasks } from "@/services/task.service";
import { SectionType } from "@/types/Section.type";
import { ExtendedReceiveTaskType, ReceiveTaskType } from "@/types/Task.type";
import { ActivityIcon, Calendar, CheckCircle, CircleCheckBig, Clock, Eye, FileText, FolderOpen, ListChecks, Pause, Play, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Pagination } from "../atoms/Pagination";
import RouteWrapper from "../atoms/ui/RouteWrapper";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";

const EnhancedTaskRowComponent: React.FC<{
    task: ExtendedReceiveTaskType;
    level: number;
    sectionName: string;
    index: number;
    formatTime: (seconds: number) => string;
    getStatusBadge: (status: string) => JSX.Element;
}> = ({ task, level, formatTime, getStatusBadge }) => {

    const { t } = useLanguage();
    const { setSnackbarConfig } = useMokkBar();
    const {
        elapsedTime,
        isRunning,
        pauseTimer,
        startTimer,
        isLoading,
    } = useTaskTimer(task.id, task.timeLogs);

    const getPriorityBorderColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'border-l-red-500';
            case 'MEDIUM': return 'border-l-yellow-500';
            case 'LOW': return 'border-l-green-500';
            default: return 'border-l-gray-400';
        }
    };

    const isDueSoon = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays <= 3 && diffDays > 0;
    };

    const showTimeTracking = useTasksGuard(["enableTimeTracking"]);

    return (
        <div
            className={`grid ${showTimeTracking ? " grid-cols-6 " : " grid-cols-5 "} px-6 py-2 cursor-pointer group border-l-4 ${getPriorityBorderColor(task.priority)} hover:bg-secondary/50 transition-all duration-300 ${task.parent_task ? 'bg-slate-500/5 hover:bg-slate-500/10' : 'bg-dark'
                } border-b border-1 border-main`}
            style={{ paddingLeft: level > 0 ? `${24 + (level * 20)}px` : '24px' }}
        >
            {/* Task ID */}
            <div className="flex items-center">
                <span className="text-sm font-medium text-blue-400 hover:text-blue-300">
                    {`${task.id.slice(-5).toUpperCase()}`}
                </span>
            </div>

            {/* Task Name & Assignee */}
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    {level > 0 && (
                        <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full font-medium">
                            {t("Subtask")}
                        </span>
                    )}
                    <span className={`text-sm font-medium truncate group-hover:text-blue-300 transition-colors duration-300 ${task.parent_task ? 'text-slate-200' : 'text-twhite'
                        }`}>
                        {task.name}
                    </span>
                </div>
                {task.assignee && (
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{task.assignee.name}</span>
                    </div>
                )}
            </div>

            {/* Due Date */}
            <div className="flex items-center">
                <span className={`text-sm ${task.is_over_due ? 'text-red-500' : 'text-gray-400'
                    } ${isDueSoon(task.due_date) ? "animate-pulse" : ""}`}>
                    {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {/* Status */}
            <div className="flex items-center">
                {getStatusBadge(task.status)}
            </div>

            {/* Time Tracking */}
            {showTimeTracking && (
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">
                            {formatTime(task?.totalTimeSpent || 0)}
                        </span>
                    </div>
                    {isRunning && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400 font-medium">
                                {formatTime(elapsedTime)} {t("running")}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Actions & Timer Controls */}
            <div className="flex items-center gap-5">
                {/* View Details Button */}
                <div className="flex items-center">
                    <RouteWrapper
                        href={`/tasks/${task.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 border border-gray-600/20 hover:border-blue-500/30"
                    >
                        <button
                            className="w-full h-full flex items-center justify-center"
                            title={t("View Details")}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </RouteWrapper>
                </div>
                <div className="flex items-center gap-2">
                    {/* Timer Controls */}
                    {showTimeTracking && task?.status !== "DONE" && (
                        <div className="flex gap-2">
                            {!isRunning ? (
                                <button
                                    disabled={isLoading}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${!isLoading
                                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 border border-blue-500/20"
                                        : "bg-gray-700/40 text-gray-500 cursor-not-allowed border border-gray-600/20"
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
                                    <Play className="w-3 h-3" />
                                    {elapsedTime > 0 ? t("Resume") : t("Start")}
                                </button>
                            ) : (
                                <button
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-md hover:shadow-red-500/10 transition-all duration-300 border border-red-500/20"
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
                                    <Pause className="w-3 h-3" />
                                    {t("Pause")}
                                </button>
                            )}
                        </div>
                    )}

                    {showTimeTracking && task?.status === "DONE" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20 shadow-sm shadow-green-500/10 transition-all duration-300 hover:bg-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            {t("Completed")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ListTasks = ({
    tasksData,
    sections,
}: {
    tasksData: ReceiveTaskType[] | undefined;
    sections: SectionType[] | undefined;
}) => {
    const [tasks, setTasks] = useState<{
        [key: string]: ReceiveTaskType[];
    }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { t } = useLanguage();
    const { organizeTasksByHierarchy } = useHierarchy();

    useEffect(() => {
        if (tasksData) {
            const categorizedTasks = categorizeTasks(tasksData);
            setTasks(categorizedTasks);
        }
    }, [tasksData]);

    // Reset to first page when items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Flatten all tasks with their section information
    const getAllTasksWithSections = () => {
        const allTasks: Array<{ task: ReceiveTaskType; sectionName: string }> = [];

        if (sections && tasksData) {
            sections.forEach((section) => {
                // Find tasks whose section name matches the section's name
                const sectionTasks = tasksData.filter(task => task.section && task.section.name === section.name);
                sectionTasks.forEach((task) => {
                    allTasks.push({
                        task,
                        sectionName: section.name
                    });
                });
            });
        }

        return allTasks;
    };

    const allTasksWithSections = getAllTasksWithSections();
    const organizedTasks = organizeTasksByHierarchy(allTasksWithSections.map(item => item.task));

    // Calculate total time spent across all tasks (including subtasks)
    const calculateTotalTimeSpent = () => {
        let totalSeconds = 0;

        const addTaskTime = (task: ExtendedReceiveTaskType) => {
            totalSeconds += task.totalTimeSpent || 0;
            // Add subtasks time
            if (task.subTasks && task.subTasks.length > 0) {
                task.subTasks.forEach(subTask => addTaskTime(subTask));
            }
        };

        organizedTasks.forEach(task => addTaskTime(task));
        return totalSeconds;
    };

    const totalTimeSpent = calculateTotalTimeSpent();
    const showTimeTracking = useTasksGuard(["enableTimeTracking"]);

    // Pagination logic
    const totalItems = organizedTasks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = organizedTasks.slice(startIndex, endIndex);

    // Create a map to get section name for each task
    const taskSectionMap = new Map<string, string>();
    allTasksWithSections.forEach(({ task, sectionName }) => {
        taskSectionMap.set(task.id, sectionName);
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const formatTotalHours = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const renderEnhancedTaskRow = (
        task: ExtendedReceiveTaskType,
        level: number,
        sectionName: string,
        index: number
    ) => {
        const getStatusBadge = (status: string) => {
            const statusConfig = {
                'DONE': { bg: 'bg-green-500/20', text: 'text-green-400', label: t('Completed') },
                'ONGOING': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: t('In Progress') },
                'ON_TEST': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: t('Testing') },
                'TODO': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: t('Pending') },
                'CLOSED': { bg: 'bg-red-500/20', text: 'text-red-400', label: t('Closed') },
                'CANCELED': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: t('Canceled') },
            };

            const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['TODO'];

            return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    {config.label}
                </span>
            );
        };

        return (
            <React.Fragment key={task.id}>
                <EnhancedTaskRowComponent
                    task={task}
                    level={level}
                    sectionName={sectionName}
                    index={startIndex + index} // Adjust index for pagination
                    formatTime={formatTime}
                    getStatusBadge={getStatusBadge}
                />

                {/* Render subtasks */}
                {task.subTasks && task.subTasks.map((subTask, subIndex) => (
                    <div key={subTask.id} className="transition-colors duration-150">
                        {renderEnhancedTaskRow(subTask, level + 1, sectionName, subIndex)}
                    </div>
                ))}
            </React.Fragment>
        );
    };

    return (
        <>
            <div className="bg-main rounded-lg p-4 w-full h-full">
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block bg-main rounded-xl shadow-lg shadow-black/20 border border-gray-700/50 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-secondary/50 border-b border-gray-700">
                        <div className={`grid ${showTimeTracking ? " grid-cols-6 " : " grid-cols-5 "}  px-6 py-4`}>
                            <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <ListChecks className="w-4 h-4 text-blue-400" />
                                {t("Task ID")}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <FileText className="w-4 h-4 text-gray-400" />
                                {t("Task Name")}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                {t("Planned End Date")}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <CircleCheckBig className="w-4 h-4 text-green-400" />
                                {t("Status")}
                            </div>
                            {showTimeTracking && <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <Clock className="w-4 h-4 text-orange-400" />
                                {t("Actual Time")}
                            </div>}
                            <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                                <ActivityIcon className="w-4 h-4 text-yellow-400" />
                                {t("Actions")}
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div>
                        {paginatedTasks && paginatedTasks.length > 0 ? (
                            paginatedTasks.map((task, index) => {
                                const sectionName = taskSectionMap.get(task.id) || t("Unknown Section");
                                return (
                                    <div key={task.id}>
                                        {renderEnhancedTaskRow(task, 0, sectionName, index)}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <ListChecks className="w-16 h-16 mb-4 text-gray-600" />
                                <p className="text-lg font-medium mb-2">{t("No tasks available")}</p>
                                <p className="text-sm">{t("Create tasks to see them here")}</p>
                            </div>
                        )}
                    </div>

                    {/* Total Hours Footer */}
                    {totalItems > 0 && (
                        <div className="bg-secondary/30 border-t border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-medium text-gray-300">
                                        {t("Total Actual Time")}:
                                    </span>
                                    <span className="text-lg font-bold text-blue-400">
                                        {formatTotalHours(totalTimeSpent)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {t("Across")} {totalItems} {t("tasks")}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            totalItems={totalItems}
                            t={t}
                        />
                    )}
                </div>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="md:hidden space-y-4">
                    {paginatedTasks && paginatedTasks.length > 0 ? (
                        <>
                            {paginatedTasks.map((task) => {
                                const sectionName = taskSectionMap.get(task.id) || t("Unknown Section");

                                const renderMobileTaskCard = (taskItem: ExtendedReceiveTaskType, level: number = 0) => (
                                    <div
                                        key={taskItem.id}
                                        className={`rounded-lg p-4 border-l-4 hover:bg-secondary/50 transition-all duration-300 cursor-pointer ${taskItem.parent_task
                                            ? "bg-slate-500/5 border-slate-400"
                                            : "bg-dark border-gray-400"
                                            } ${taskItem.status === "DONE" ? "border-green-400" :
                                                taskItem.status === "ONGOING" ? "border-blue-400" :
                                                    taskItem.status === "ON_TEST" ? "border-yellow-400" :
                                                        taskItem.status === "CLOSED" ? "border-red-400" :
                                                            taskItem.status === "CANCELED" ? "border-purple-400" :
                                                                taskItem.parent_task ? "border-slate-400" : "border-gray-400"
                                            } ${level > 0 ? `mt-2` : ""}`}
                                        style={{ marginLeft: level > 0 ? `${level * 16}px` : '0' }}
                                    >
                                        {/* Task Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {taskItem.parent_task ? (
                                                        <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full font-medium">
                                                            🔗 {t("Subtask")}
                                                        </span>
                                                    ) : null}
                                                    <h3 className={`font-semibold text-base ${taskItem.parent_task ? 'text-slate-200' : 'text-twhite'
                                                        }`}>{taskItem.name}</h3>
                                                </div>
                                                {taskItem.assignee && (
                                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                        <span>👤</span>
                                                        <span>{taskItem.assignee.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskItem.status === "DONE" ? "bg-green-500/20 text-green-400" :
                                                    taskItem.status === "ONGOING" ? "bg-blue-500/20 text-blue-400" :
                                                        taskItem.status === "ON_TEST" ? "bg-yellow-500/20 text-yellow-400" :
                                                            taskItem.status === "CLOSED" ? "bg-red-500/20 text-red-400" :
                                                                taskItem.status === "CANCELED" ? "bg-purple-500/20 text-purple-400" :
                                                                    "bg-gray-500/20 text-gray-400"
                                                    }`}>
                                                    {t(taskItem.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Task Details Grid */}
                                        <div className="grid grid-cols-1 gap-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{t("Planned End Date")}</span>
                                                    </div>
                                                    <span className={`text-sm ${taskItem.is_over_due ? "text-red-500" : "text-gray-300"}`}>
                                                        {new Date(taskItem.due_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                        <FolderOpen className="w-4 h-4" />
                                                        <span>{t("Section")}</span>
                                                    </div>
                                                    <span className="text-sm text-orange-400 font-medium">{sectionName}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Tracking and Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-secondary/30 px-3 py-2 rounded-lg">
                                                <span className="text-blue-400">⏱️</span>
                                                <span className="text-sm text-gray-300">
                                                    {Math.floor((taskItem?.totalTimeSpent || 0) / 3600)}h {Math.floor(((taskItem?.totalTimeSpent || 0) % 3600) / 60)}m
                                                </span>
                                            </div>

                                            <RouteWrapper
                                                href={`/tasks/${task.id}`}

                                            >
                                                <button
                                                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                                                >
                                                    {t("View Details")}
                                                </button>
                                            </RouteWrapper>
                                        </div>

                                        {/* Subtasks indicator */}
                                        {taskItem.subTasks && taskItem.subTasks.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <span className="text-xs text-gray-400">
                                                    📋 {taskItem.subTasks.length} {t("subtasks")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );

                                return (
                                    <div key={task.id}>
                                        {renderMobileTaskCard(task, 0)}
                                        {task.subTasks && task.subTasks.map((subTask: ExtendedReceiveTaskType) =>
                                            renderMobileTaskCard(subTask, 1)
                                        )}
                                    </div>
                                );
                            })}

                            {/* Mobile Total Hours Footer */}
                            {totalItems > 0 && (
                                <div className="bg-secondary/30 border border-gray-700 rounded-lg p-4 mt-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-medium text-gray-300">
                                                {t("Total Actual Time")}:
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-blue-400">
                                                {formatTotalHours(totalTimeSpent)}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {t("Across")} {totalItems} {t("tasks")}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            ({formatTime(totalTimeSpent)})
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Pagination */}
                            {totalItems > itemsPerPage && (
                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                        totalItems={totalItems}
                                        t={t}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <ListChecks className="w-16 h-16 mb-4 text-gray-600" />
                            <p className="text-lg font-medium mb-2 text-center">{t("No tasks available")}</p>
                            <p className="text-sm text-center">{t("Create tasks to see them here")}</p>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default ListTasks;