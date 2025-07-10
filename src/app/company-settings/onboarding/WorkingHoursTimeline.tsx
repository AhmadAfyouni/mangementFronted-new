import { DayWorkingHours, WorkDay, CompanySettingsType } from "@/types/CompanySettings.type";
import { Calendar, Clock, Coffee } from "lucide-react";
import { useState, useRef, useEffect } from "react";


// Working Hours Timeline Component
export interface WorkingHoursTimelineProps {
    dayWorkingHours: DayWorkingHours[];
    onDayWorkingHoursChange: (day: WorkDay, field: keyof DayWorkingHours, value: string | number | boolean | undefined) => void;
    onWorkDayToggle: (day: WorkDay) => void;
    isEditing: boolean;
    t: (key: string) => string;
    companySettings?: CompanySettingsType;
    workingHoursErrors: Record<WorkDay, string>;
}

export const WorkingHoursTimeline: React.FC<WorkingHoursTimelineProps> = ({
    dayWorkingHours,
    onDayWorkingHoursChange,
    onWorkDayToggle,
    isEditing,
    t,
    companySettings,
    workingHoursErrors,
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

                        {/* Error message for invalid time range */}
                        {isEditing && dayHours.isWorkingDay && workingHoursErrors[dayHours.day] && (
                            <div className="mt-1 text-xs text-red-400 font-medium">
                                {workingHoursErrors[dayHours.day]}
                            </div>
                        )}

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