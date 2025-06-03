import React, { useState } from 'react';
import CustomModal from './CustomModal';
import { ProjectStatus, RoutineTaskType } from '@/types/JobTitle.type';
import useCustomTheme from '@/hooks/useCustomTheme';
import { Clock, Calendar, CheckSquare, ListChecks, Info, CheckCircle, Play, RefreshCw, Loader2 } from 'lucide-react';
import { updateRoutineTaskStatus } from '@/services/job.service';

interface RoutineTasksSectionProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: RoutineTaskType[];
    title: string;
    t: (key: string) => string;
    language: "en" | "ar";
    jobTitleId: string;
    onTaskUpdated?: (updatedTask: RoutineTaskType) => void;
}

const RoutineTasksModal: React.FC<RoutineTasksSectionProps> = ({
    isOpen,
    onClose,
    tasks,
    title,
    t,
    language,
    onTaskUpdated
}) => {
    const { isLightMode } = useCustomTheme();

    const capitalize = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const taskContent = (
        <div className="space-y-6">
            {tasks.length === 0 ? (
                <p className="text-center text-gray-400">{t("No routine tasks found")}</p>
            ) : (
                tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`${isLightMode ? 'bg-gray-50' : 'bg-dark'} p-4 rounded-lg border ${isLightMode ? 'border-gray-200' : 'border-gray-700'
                            }`}
                    >
                        <p className={`text-sm mb-3 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{task.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-blue-500" />
                                <span className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{t("Type")}: </span>
                                <span className={`font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{capitalize(task.recurringType)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="text-green-500" />
                                <span className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{t("Interval")}: </span>
                                <span className={`font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{task.intervalDays} {t("days")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="text-purple-500" />
                                <span className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{t("Est. Hours")}: </span>
                                <span className={`font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{task.estimatedHours}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckSquare size={16} className={task.isActive ? "text-green-500" : "text-red-500"} />
                                <span className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{t("Status")}: </span>
                                <span className={`font-medium ${task.isActive ? "text-green-500" : "text-red-500"}`}>
                                    {task.isActive ? t("Active") : t("Inactive")}
                                </span>
                            </div>
                        </div>

                        {
                            task.instructions && task.instructions.length > 0 && (
                                <div className="mb-4">
                                    <h5 className={`text-sm font-medium mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                                        <Info size={14} className="text-blue-500" />
                                        {t("Instructions")}:
                                    </h5>
                                    <ul className={`list-disc pl-5 space-y-1 text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {task.instructions.map((instruction, i) => (
                                            <li key={i}>{instruction}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        }

                        {
                            task.hasSubTasks && task.subTasks && task.subTasks.length > 0 && (
                                <div>
                                    <h5 className={`text-sm font-medium mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                                        <ListChecks size={14} className="text-blue-500" />
                                        {t("Subtasks")}:
                                    </h5>
                                    <div className="space-y-2">
                                        {task.subTasks.map((subtask, i) => (
                                            <div
                                                key={i}
                                                className={`p-2 rounded ${isLightMode ? 'bg-gray-100' : 'bg-gray-800'} text-sm`}
                                            >
                                                <div className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>{subtask.name}</div>
                                                <div className={isLightMode ? 'text-gray-600' : 'text-gray-300'}>
                                                    {subtask.description}
                                                </div>
                                                <div className="text-xs mt-1 flex items-center gap-1 text-gray-400">
                                                    <Clock size={12} className="text-blue-400" />
                                                    {t("Est.")}: {subtask.estimatedHours}h
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                ))
            )}
        </div >
    );

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            content={taskContent}
            language={language}
            actionText={t("Close")}
            maxWidth="md"
        />
    );
};

export default RoutineTasksModal; 