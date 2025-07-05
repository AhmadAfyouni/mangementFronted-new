"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Settings, Clock, Bell, FileText, Calendar, Save, Edit3, Coffee } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRolePermissions } from "@/hooks/useCheckPermissions";

// Enums matching backend
enum WorkDay {
    SUNDAY = 'Sunday',
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday'
}

enum ProgressCalculationMethod {
    TIME_BASED = 'time_based',
    DATE_BASED = 'date_based'
}

interface DayWorkingHours {
    day: WorkDay;
    isWorkingDay: boolean;
    startTime?: string;
    endTime?: string;
    breakTimeMinutes?: number | undefined;
}

interface TaskFieldSettings {
    enableEstimatedTime?: boolean;
    enableActualTime?: boolean;
    enablePriority?: boolean;
    enableDueDate?: boolean;
    enableFiles?: boolean;
    enableComments?: boolean;
    enableSubTasks?: boolean;
    enableTimeTracking?: boolean;
    enableRecurring?: boolean;
    enableDependencies?: boolean;
}

interface WorkSettings {
    dayWorkingHours?: DayWorkingHours[];
    holidays?: string[];
    timezone?: string;
    overtimeRate?: number;
    defaultBreakTimeMinutes?: number | undefined;
}

interface CompanySettings {
    _id?: string;
    workSettings: WorkSettings;
    taskFieldSettings: TaskFieldSettings;
    progressCalculationMethod?: ProgressCalculationMethod;
    allowTaskDuplication?: boolean;
    requireTaskApproval?: boolean;
    autoGenerateTaskIds?: boolean;
    defaultTaskReminderDays?: number;
    enableEmailNotifications?: boolean;
    enablePushNotifications?: boolean;
    enableTaskDeadlineReminders?: boolean;
    enableProjectDeadlineReminders?: boolean;
    maxFileUploadSize?: number;
    allowedFileTypes?: string[];
    isActive?: boolean;
    lastUpdated?: Date;
}

// Working Hours Timeline Component
interface WorkingHoursTimelineProps {
    dayWorkingHours: DayWorkingHours[];
    onDayWorkingHoursChange: (day: WorkDay, field: keyof DayWorkingHours, value: string | number | boolean | undefined) => void;
    onWorkDayToggle: (day: WorkDay) => void;
    isEditing: boolean;
    t: (key: string) => string;
    companySettings?: CompanySettings; // Added this line
}

const WorkingHoursTimeline: React.FC<WorkingHoursTimelineProps> = ({
    dayWorkingHours,
    onDayWorkingHoursChange,
    onWorkDayToggle,
    isEditing,
    t,
    companySettings
}) => {
    const [dragInfo, setDragInfo] = useState<{
        day: WorkDay;
        type: 'start' | 'end' | 'break';
        isDragging: boolean;
    } | null>(null);

    const timelineRef = useRef<HTMLDivElement>(null);

    // Generate hour markers (6 AM to 12 AM - 18 hours total)
    const startHour = 8; // Start from 6 AM
    const endHour = 21; // End at 12 AM (midnight)
    const totalDisplayHours = endHour - startHour; // 18 hours
    const hours = Array.from({ length: totalDisplayHours + 1 }, (_, i) => startHour + i);

    // Convert time string to percentage position (relative to 6 AM - 12 AM range)
    const timeToPercentage = (time: string): number => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const startMinutes = startHour * 60; // 6 AM in minutes
        const endMinutes = endHour * 60; // 12 AM in minutes

        // Clamp the time to our display range
        const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, totalMinutes));

        // Convert to percentage of our display range
        return ((clampedMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
    };

    // Convert percentage to time string (relative to 6 AM - 12 AM range)
    const percentageToTime = (percentage: number): string => {
        const startMinutes = startHour * 60; // 6 AM in minutes
        const endMinutes = endHour * 60; // 12 AM in minutes
        const totalMinutes = startMinutes + (percentage / 100) * (endMinutes - startMinutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Get position from mouse event
    const getPositionFromEvent = (e: React.MouseEvent | MouseEvent): number => {
        if (!timelineRef.current) return 0;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        return Math.max(0, Math.min(100, percentage));
    };

    // Handle drag start
    const handleDragStart = (day: WorkDay, type: 'start' | 'end' | 'break', e: React.MouseEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setDragInfo({ day, type, isDragging: true });
    };

    // Handle drag during mouse move
    const handleMouseMove = (e: MouseEvent) => {
        if (!dragInfo || !dragInfo.isDragging) return;

        const percentage = getPositionFromEvent(e);
        const time = percentageToTime(percentage);

        if (dragInfo.type === 'start') {
            onDayWorkingHoursChange(dragInfo.day, 'startTime', time);
        } else if (dragInfo.type === 'end') {
            onDayWorkingHoursChange(dragInfo.day, 'endTime', time);
        }
    };

    // Handle drag end
    const handleMouseUp = () => {
        setDragInfo(null);
    };

    // Add global mouse event listeners
    useEffect(() => {
        if (dragInfo?.isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo]);

    // Calculate working hours duration
    const getWorkingDuration = (dayHours: DayWorkingHours): string => {
        if (!dayHours.startTime || !dayHours.endTime) return '0h';

        const [startH, startM] = dayHours.startTime.split(':').map(Number);
        const [endH, endM] = dayHours.endTime.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const duration = endMinutes - startMinutes - (dayHours.breakTimeMinutes || 0);

        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };


    // Format time display with validation
    const formatTimeDisplay = (time: string): string => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hourNum = parseInt(hours);

        // Show warning for out-of-range times
        if (hourNum < startHour && hourNum !== 0) {
            return `${hours}:${minutes} ⚠️`;
        }

        return `${hours}:${minutes}`;
    };

    // Show loading state if data is still being fetched
    if (!companySettings && !isEditing) {
        return (
            <div className="bg-secondary rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-twhite flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        {t("Working Hours Timeline")} <span className="text-sm text-gray-400 font-normal">(6 AM - 12 AM)</span>
                    </h3>
                    <div className="text-sm text-gray-400">
                        {t("Loading schedule...")}
                    </div>
                </div>
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">{t("Loading working hours...")}</span>
                </div>
            </div>
        );
    }

    // ✅ ADD THIS RETURN STATEMENT
    return (
        <div className="bg-secondary rounded-xl p-6">

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-twhite flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    {t("Working Hours Timeline")} <span className="text-sm text-gray-400 font-normal">(6 AM - 12 AM)</span>
                </h3>
            </div>

            {/* Time Scale Header */}
            <div className="mb-4">
                <div className="relative" ref={timelineRef}>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                            <div key={hour} className="text-center">
                                {hour === 24 ? '00' : hour.toString().padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-dark rounded-full relative">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="absolute top-0 w-px h-full bg-gray-700"
                                style={{ left: `${((hour - startHour) / totalDisplayHours) * 100}%` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Days Timeline */}
            <div className="space-y-3">
                {dayWorkingHours.map((dayHours) => (
                    <div key={dayHours.day} className="relative">
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => isEditing && onWorkDayToggle(dayHours.day)}
                                    disabled={!isEditing}
                                    className={`relative w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${dayHours.isWorkingDay
                                        ? 'bg-blue-600 border-blue-500 shadow-md shadow-blue-500/20'
                                        : 'bg-transparent border-gray-500 hover:border-gray-400'
                                        } ${isEditing
                                            ? 'cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95'
                                            : 'cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    {/* Checkmark Icon */}
                                    {dayHours.isWorkingDay && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}

                                    {/* Edit Mode Indicator */}
                                    {isEditing && (
                                        <div className={`absolute -top-1 -right-1 w-2 h-2 ${dayHours.isWorkingDay ? "bg-green-400" : "bg-red-400"} rounded-full animate-pulse`} />
                                    )}
                                </button>
                                <span className={`font-medium text-sm w-20 ${dayHours.isWorkingDay ? 'text-twhite' : 'text-gray-500'
                                    }`}>
                                    {t(dayHours.day)}
                                </span>
                                {dayHours.isWorkingDay && (
                                    <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full border border-gray-500/30">
                                        {getWorkingDuration(dayHours)}
                                    </span>
                                )}
                            </div>

                            {dayHours.isWorkingDay && (
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTimeDisplay(dayHours.startTime || '')} - {formatTimeDisplay(dayHours.endTime || '')}</span>
                                    </div>
                                    {dayHours.breakTimeMinutes && dayHours.breakTimeMinutes > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Coffee className="w-3 h-3" />
                                            <span>{dayHours.breakTimeMinutes}m break</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Timeline Bar */}
                        <div className="relative h-8 bg-dark rounded-lg overflow-hidden">
                            {dayHours.isWorkingDay && dayHours.startTime && dayHours.endTime ? (
                                <>
                                    {/* Working Hours Block */}
                                    <div
                                        className="absolute top-1 bottom-1 bg-gradient-to-r from-gray-600 to-gray-500 rounded-md shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-500/30"
                                        style={{
                                            left: `${timeToPercentage(dayHours.startTime)}%`,
                                            width: `${timeToPercentage(dayHours.endTime) - timeToPercentage(dayHours.startTime)}%`
                                        }}
                                    >
                                        {/* Break Time Indicator */}
                                        {dayHours.breakTimeMinutes ? dayHours.breakTimeMinutes > 0 && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <div className="w-1 h-4 bg-orange-400 rounded-full opacity-80" />
                                            </div>
                                        ) : ""}
                                    </div>

                                    {/* Start Time Handle */}
                                    {isEditing && (
                                        <div
                                            className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize hover:bg-blue-400 transition-colors group border-r border-blue-400"
                                            style={{ left: `${timeToPercentage(dayHours.startTime)}%` }}
                                            onMouseDown={(e) => handleDragStart(dayHours.day, 'start', e)}
                                        >
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-secondary text-twhite text-xs px-2 py-1 rounded border border-gray-600">
                                                    {formatTimeDisplay(dayHours.startTime)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* End Time Handle */}
                                    {isEditing && (
                                        <div
                                            className="absolute top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize hover:bg-blue-400 transition-colors group border-l border-blue-400"
                                            style={{ left: `${timeToPercentage(dayHours.endTime) - 0.5}%` }}
                                            onMouseDown={(e) => handleDragStart(dayHours.day, 'end', e)}
                                        >
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-secondary text-twhite text-xs px-2 py-1 rounded border border-gray-600">
                                                    {formatTimeDisplay(dayHours.endTime)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">
                                        {dayHours.isWorkingDay ? t("Set working hours") : t("Non-working day")}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Advanced Settings Panel (when editing) */}
                        {isEditing && dayHours.isWorkingDay && (
                            <div className="mt-2 p-4 bg-dark rounded-xl border border-gray-700/50 shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-twhite">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-green-400" />
                                                {t("Start Time")}
                                            </div>
                                        </label>
                                        <div className="relative overflow-hidden rounded-lg transition-all duration-300 ring-1 ring-gray-600/50 hover:ring-gray-500/70 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-main opacity-90" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
                                            <input
                                                type="time"
                                                value={dayHours.startTime || ""}
                                                onChange={(e) => onDayWorkingHoursChange(dayHours.day, "startTime", e.target.value)}
                                                className="relative w-full bg-transparent border-0 px-3 py-2.5 text-twhite placeholder-gray-400 focus:outline-none text-sm font-mono tracking-wider"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-400 transition-colors">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-twhite">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-red-400" />
                                                {t("End Time")}
                                            </div>
                                        </label>
                                        <div className="relative overflow-hidden rounded-lg transition-all duration-300 ring-1 ring-gray-600/50 hover:ring-gray-500/70 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-main opacity-90" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_70%)]" />
                                            <input
                                                type="time"
                                                value={dayHours.endTime || ""}
                                                onChange={(e) => onDayWorkingHoursChange(dayHours.day, "endTime", e.target.value)}
                                                className="relative w-full bg-transparent border-0 px-3 py-2.5 text-twhite placeholder-gray-400 focus:outline-none text-sm font-mono tracking-wider"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-twhite">
                                            <div className="flex items-center gap-2">
                                                <Coffee className="w-3.5 h-3.5 text-orange-400" />
                                                {t("Break (minutes)")}
                                            </div>
                                        </label>
                                        <div className="relative overflow-hidden rounded-lg transition-all duration-300 ring-1 ring-gray-600/50 hover:ring-gray-500/70 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-main opacity-90" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={dayHours.breakTimeMinutes || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    onDayWorkingHoursChange(
                                                        dayHours.day,
                                                        "breakTimeMinutes",
                                                        value === "" ? undefined : parseInt(value)
                                                    );
                                                }}
                                                className="relative w-full bg-transparent border-0 px-3 py-2.5 text-twhite placeholder-gray-400 focus:outline-none text-sm font-medium [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                placeholder="0"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-medium">
                                                min
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>)
};

const CompanySettings = () => {
    const [activeTab, setActiveTab] = useState("work");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CompanySettings>({
        workSettings: {
            dayWorkingHours: [
                { day: WorkDay.SUNDAY, isWorkingDay: true, startTime: "09:00", endTime: "17:00", breakTimeMinutes: 60 },
                { day: WorkDay.MONDAY, isWorkingDay: true, startTime: "09:00", endTime: "17:00", breakTimeMinutes: 60 },
                { day: WorkDay.TUESDAY, isWorkingDay: true, startTime: "09:00", endTime: "17:00", breakTimeMinutes: 60 },
                { day: WorkDay.WEDNESDAY, isWorkingDay: true, startTime: "09:00", endTime: "17:00", breakTimeMinutes: 60 },
                { day: WorkDay.THURSDAY, isWorkingDay: true, startTime: "09:00", endTime: "17:00", breakTimeMinutes: 60 },
                { day: WorkDay.FRIDAY, isWorkingDay: false },
                { day: WorkDay.SATURDAY, isWorkingDay: false }
            ],
            holidays: [],
            timezone: "Asia/Riyadh",
            overtimeRate: 1,
            defaultBreakTimeMinutes: 60
        },
        taskFieldSettings: {
            enableEstimatedTime: true,
            enableActualTime: true,
            enablePriority: true,
            enableDueDate: true,
            enableFiles: true,
            enableComments: true,
            enableSubTasks: true,
            enableTimeTracking: true,
            enableRecurring: true,
            enableDependencies: true
        },
        progressCalculationMethod: ProgressCalculationMethod.TIME_BASED,
        allowTaskDuplication: true,
        requireTaskApproval: false,
        autoGenerateTaskIds: true,
        defaultTaskReminderDays: 5,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        enableTaskDeadlineReminders: true,
        enableProjectDeadlineReminders: true,
        maxFileUploadSize: 10,
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
        isActive: true
    });

    const { t, currentLanguage } = useLanguage();
    const isAdmin = useRolePermissions("admin");
    const isRTL = currentLanguage === "ar";

    // Get all work days from enum
    const allWorkDays = Object.values(WorkDay);

    // Fetch company settings
    const { data: companySettings } = useCustomQuery<CompanySettings>({
        queryKey: ["company-settings"],
        url: "/company-settings",
        nestedData: true,
    });

    // Update company settings mutation
    const { mutate: updateSettings, isPending: isUpdating } = useCreateMutation({
        endpoint: "/company-settings",
        onSuccessMessage: "Company settings updated successfully!",
        invalidateQueryKeys: ["company-settings"],
        requestType: "put",
    });

    // Create company settings mutation
    const { mutate: createSettings, isPending: isCreating } = useCreateMutation({
        endpoint: "/company-settings",
        onSuccessMessage: "Company settings created successfully!",
        invalidateQueryKeys: ["company-settings"],
        requestType: "post",
    });

    // Initialize form data when company settings are loaded
    useEffect(() => {
        if (companySettings) {
            // Ensure all days are represented in dayWorkingHours
            const existingDays = companySettings.workSettings.dayWorkingHours || [];
            const dayWorkingHours = allWorkDays.map(day => {
                const existingDay = existingDays.find(d => d.day === day);
                return existingDay || {
                    day,
                    isWorkingDay: false
                };
            });

            setFormData({
                ...companySettings,
                workSettings: {
                    ...companySettings.workSettings,
                    dayWorkingHours
                }
            });
        }
    }, [companySettings]);

    // Get the current working hours data (either from fetched data or form data)
    const getCurrentWorkingHours = (): DayWorkingHours[] => {
        // If we're not editing and have fetched data, use that
        if (!isEditing && companySettings?.workSettings?.dayWorkingHours) {
            const existingDays = companySettings.workSettings.dayWorkingHours;
            return allWorkDays.map(day => {
                const existingDay = existingDays.find(d => d.day === day);
                return existingDay || {
                    day,
                    isWorkingDay: false
                };
            });
        }
        // Otherwise use form data (when editing or no fetched data yet)
        return formData.workSettings.dayWorkingHours || [];
    };

    // Using currentTarget instead (which is already properly typed)
    const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
        e.currentTarget.blur(); // currentTarget is already typed as HTMLInputElement
        e.preventDefault();
    };

    const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
        }
    };

    const handleDayWorkingHoursChange = (day: WorkDay, field: keyof DayWorkingHours, value: string | number | boolean | undefined) => {
        setFormData(prev => ({
            ...prev,
            workSettings: {
                ...prev.workSettings,
                dayWorkingHours: prev.workSettings.dayWorkingHours?.map(dwh =>
                    dwh.day === day
                        ? { ...dwh, [field]: value }
                        : dwh
                ) || []
            }
        }));
    };

    const handleWorkSettingsChange = (field: keyof WorkSettings, value: string | number | string[] | undefined) => {
        setFormData(prev => ({
            ...prev,
            workSettings: {
                ...prev.workSettings,
                [field]: value
            }
        }));
    };

    const handleTaskFieldChange = (field: keyof TaskFieldSettings, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            taskFieldSettings: {
                ...prev.taskFieldSettings,
                [field]: value
            }
        }));
    };

    const handleGeneralSettingChange = (field: keyof CompanySettings, value: boolean | number | string | string[] | ProgressCalculationMethod) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleWorkDayToggle = (day: WorkDay) => {
        const dayWorkingHours = formData.workSettings.dayWorkingHours || [];
        const dayIndex = dayWorkingHours.findIndex(dwh => dwh.day === day);

        if (dayIndex !== -1) {
            const currentDay = dayWorkingHours[dayIndex];
            const isCurrentlyWorking = currentDay.isWorkingDay;

            handleDayWorkingHoursChange(day, 'isWorkingDay', !isCurrentlyWorking);

            // If enabling work day, set default times if not already set
            if (!isCurrentlyWorking) {
                if (!currentDay.startTime) {
                    handleDayWorkingHoursChange(day, 'startTime', "09:00");
                }
                if (!currentDay.endTime) {
                    handleDayWorkingHoursChange(day, 'endTime', "17:00");
                }
                if (!currentDay.breakTimeMinutes) {
                    handleDayWorkingHoursChange(day, 'breakTimeMinutes', formData.workSettings.defaultBreakTimeMinutes || 60);
                }
            }
        }
    };

    const handleSave = () => {
        // Filter out non-working days from dayWorkingHours before sending
        const dataToSend = {
            ...formData,
            workSettings: {
                ...formData.workSettings,
                dayWorkingHours: formData.workSettings.dayWorkingHours?.filter(dwh => dwh.isWorkingDay) || []
            }
        };

        if (companySettings?._id) {
            updateSettings(dataToSend);
        } else {
            createSettings(dataToSend);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (companySettings) {
            const existingDays = companySettings.workSettings.dayWorkingHours || [];
            const dayWorkingHours = allWorkDays.map(day => {
                const existingDay = existingDays.find(d => d.day === day);
                return existingDay || {
                    day,
                    isWorkingDay: false
                };
            });

            setFormData({
                ...companySettings,
                workSettings: {
                    ...companySettings.workSettings,
                    dayWorkingHours
                }
            });
        }
        setIsEditing(false);
    };

    if (!isAdmin) {
        return (
            <GridContainer>
                <div className="col-span-full min-h-screen bg-main flex items-center justify-center">
                    <div className="text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-bold text-twhite mb-2">{t("Access Denied")}</h2>
                        <p className="text-gray-400">{t("You don't have permission to access company settings")}</p>
                    </div>
                </div>
            </GridContainer>
        );
    }

    return (
        <GridContainer>
            <div className={`col-span-full min-h-screen bg-main ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="bg-secondary rounded-2xl shadow-xl p-6 mb-6">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-twhite">{t("Company Settings")}</h1>
                                    <p className="text-gray-400">{t("Configure your company's operational settings")}</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isUpdating || isCreating}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isUpdating || isCreating ? t("Saving...") : t("Save")}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {t("Cancel")}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        {t("Edit")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-secondary rounded-xl shadow-lg p-2 mb-6">
                        <div className={`flex gap-2 overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {[
                                { id: "work", icon: Clock, label: "Work Settings" },
                                { id: "tasks", icon: FileText, label: "Task Settings" },
                                { id: "notifications", icon: Bell, label: "Notifications" },
                                { id: "files", icon: FileText, label: "File Management" },
                                { id: "general", icon: Settings, label: "General" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-tblack text-twhite shadow-lg transform scale-105"
                                        : "text-gray-400 hover:text-twhite hover:bg-dark"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="font-medium text-sm">{t(tab.label)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "work" && (
                        <div className="space-y-6">
                            {/* Working Hours Timeline - Uses fetched data when available */}
                            <WorkingHoursTimeline
                                dayWorkingHours={getCurrentWorkingHours()}
                                onDayWorkingHoursChange={handleDayWorkingHoursChange}
                                onWorkDayToggle={handleWorkDayToggle}
                                isEditing={isEditing}
                                t={t}
                                companySettings={companySettings} // Added this line
                            />

                            {/* Additional Work Settings */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-400" />
                                    {t("Additional Settings")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Default Break Time (minutes)")}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.workSettings.defaultBreakTimeMinutes ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "") {
                                                    handleWorkSettingsChange("defaultBreakTimeMinutes", undefined);
                                                } else {
                                                    const numValue = parseInt(value);
                                                    if (!isNaN(numValue) && numValue >= 0) {
                                                        handleWorkSettingsChange("defaultBreakTimeMinutes", numValue);
                                                    }
                                                }
                                            }}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder="Enter break time in minutes"
                                            onWheel={handleNumberInputWheel}
                                            onKeyDown={handleNumberInputKeyDown}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t("Used as default for new working days")}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Overtime Rate")}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={formData.workSettings.overtimeRate ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "") {
                                                    handleWorkSettingsChange("overtimeRate", undefined);
                                                } else {
                                                    const numValue = parseFloat(value);
                                                    if (!isNaN(numValue) && numValue >= 0) {
                                                        handleWorkSettingsChange("overtimeRate", numValue);
                                                    }
                                                }
                                            }}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder="1"
                                            onWheel={handleNumberInputWheel}
                                            onKeyDown={handleNumberInputKeyDown}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Timezone")}
                                        </label>
                                        <select
                                            value={formData.workSettings.timezone || ""}
                                            onChange={(e) => handleWorkSettingsChange("timezone", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">{t("Select Timezone")}</option>
                                            <option value="Asia/Riyadh">Asia/Riyadh</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York</option>
                                            <option value="Europe/London">Europe/London</option>
                                            <option value="Asia/Dubai">Asia/Dubai</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Task Settings Tab */}
                    {activeTab === "tasks" && (
                        <div className="space-y-6">
                            {/* Task Field Settings */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    {t("Task Field Settings")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(formData.taskFieldSettings).map(([field, enabled]) => (
                                        <div key={field} className="flex items-center justify-between p-4 bg-main rounded-lg">
                                            <span className="text-twhite font-medium">
                                                {t(field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={enabled || false}
                                                    onChange={(e) => handleTaskFieldChange(field as keyof TaskFieldSettings, e.target.checked)}
                                                    disabled={!isEditing}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Task Management Settings */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-green-400" />
                                    {t("Task Management")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Allow Task Duplication")}</span>
                                            <p className="text-gray-400 text-sm">{t("Allow users to duplicate existing tasks")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.allowTaskDuplication || false}
                                                onChange={(e) => handleGeneralSettingChange("allowTaskDuplication", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Require Task Approval")}</span>
                                            <p className="text-gray-400 text-sm">{t("Tasks need approval before being marked as complete")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.requireTaskApproval || false}
                                                onChange={(e) => handleGeneralSettingChange("requireTaskApproval", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Auto Generate Task IDs")}</span>
                                            <p className="text-gray-400 text-sm">{t("Automatically generate unique IDs for new tasks")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.autoGenerateTaskIds || false}
                                                onChange={(e) => handleGeneralSettingChange("autoGenerateTaskIds", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                {t("Default Task Reminder (Days)")}
                                            </label>
                                            <input
                                                type="number"
                                                onWheel={handleNumberInputWheel}
                                                onKeyDown={handleNumberInputKeyDown}
                                                min="1"
                                                value={formData.defaultTaskReminderDays || 5}
                                                onChange={(e) => handleGeneralSettingChange("defaultTaskReminderDays", parseInt(e.target.value))}
                                                disabled={!isEditing}
                                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                {t("Progress Calculation Method")}
                                            </label>
                                            <select
                                                value={formData.progressCalculationMethod || ProgressCalculationMethod.TIME_BASED}
                                                onChange={(e) => handleGeneralSettingChange("progressCalculationMethod", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            >
                                                <option value={ProgressCalculationMethod.TIME_BASED}>{t("Time Based")}</option>
                                                <option value={ProgressCalculationMethod.DATE_BASED}>{t("Date Based")}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    {t("Notification Settings")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Email Notifications")}</span>
                                            <p className="text-gray-400 text-sm">{t("Send notifications via email")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enableEmailNotifications || false}
                                                onChange={(e) => handleGeneralSettingChange("enableEmailNotifications", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Push Notifications")}</span>
                                            <p className="text-gray-400 text-sm">{t("Send push notifications to devices")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enablePushNotifications || false}
                                                onChange={(e) => handleGeneralSettingChange("enablePushNotifications", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Task Deadline Reminders")}</span>
                                            <p className="text-gray-400 text-sm">{t("Remind users about upcoming task deadlines")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enableTaskDeadlineReminders || false}
                                                onChange={(e) => handleGeneralSettingChange("enableTaskDeadlineReminders", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("Project Deadline Reminders")}</span>
                                            <p className="text-gray-400 text-sm">{t("Remind users about upcoming project deadlines")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enableProjectDeadlineReminders || false}
                                                onChange={(e) => handleGeneralSettingChange("enableProjectDeadlineReminders", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File Management Tab */}
                    {activeTab === "files" && (
                        <div className="space-y-6">
                            {/* File Management Settings */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    {t("File Management Settings")}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Maximum File Upload Size (MB)")}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            onWheel={handleNumberInputWheel}
                                            onKeyDown={handleNumberInputKeyDown}
                                            value={formData.maxFileUploadSize || 10}
                                            onChange={(e) => handleGeneralSettingChange("maxFileUploadSize", parseInt(e.target.value))}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Allowed File Types")}
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.zip', '.rar'].map((type) => (
                                                <label key={type} className="flex items-center space-x-2 p-2 bg-main rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowedFileTypes?.includes(type) || false}
                                                        onChange={(e) => {
                                                            const currentTypes = formData.allowedFileTypes || [];
                                                            const newTypes = e.target.checked
                                                                ? [...currentTypes, type]
                                                                : currentTypes.filter(t => t !== type);
                                                            handleGeneralSettingChange("allowedFileTypes", newTypes);
                                                        }}
                                                        disabled={!isEditing}
                                                        className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-twhite text-sm">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-blue-400" />
                                    {t("General Settings")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <span className="text-twhite font-medium">{t("System Active")}</span>
                                            <p className="text-gray-400 text-sm">{t("Enable or disable the entire system")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive || false}
                                                onChange={(e) => handleGeneralSettingChange("isActive", e.target.checked)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                        </label>
                                    </div>

                                    {companySettings && (
                                        <div className="p-4 bg-main rounded-lg">
                                            <h4 className="text-twhite font-medium mb-2">{t("System Information")}</h4>
                                            <div className="text-gray-400 text-sm space-y-1">
                                                <p>{t("Settings ID")}: {companySettings._id}</p>
                                                <p>{t("Last Updated")}: {new Date(companySettings.lastUpdated || '').toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GridContainer>
    );
};

export default CompanySettings;