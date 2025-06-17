"use client";

import { useState, useEffect } from "react";
import { Building2, Settings, Clock, Bell, FileText, Calendar, Save, Edit3 } from "lucide-react";
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


    const validateTimeOrder = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return true;

        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return startMinutes < endMinutes;
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

    const getWorkingDays = () => {
        return formData.workSettings.dayWorkingHours?.filter(dwh => dwh.isWorkingDay) || [];
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
                            {/* Working Days */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    {t("Working Days")}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {formData.workSettings.dayWorkingHours?.map((dayHours) => (
                                        <button
                                            key={dayHours.day}
                                            onClick={() => isEditing && handleWorkDayToggle(dayHours.day)}
                                            disabled={!isEditing}
                                            className={`p-3 rounded-lg text-center transition-all ${dayHours.isWorkingDay
                                                ? "bg-blue-600 text-white"
                                                : "bg-main text-gray-400 hover:bg-gray-700"
                                                } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            <div className="text-sm font-medium">{t(dayHours.day)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    {t("Working Hours")}
                                </h3>

                                <div className="space-y-4">
                                    {getWorkingDays().length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-md font-semibold text-twhite">{t("Working Hours for Each Day")}</h4>
                                            {getWorkingDays().map((dayHours) => (
                                                <div key={dayHours.day} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-main rounded-lg">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-blue-400">
                                                            {t(dayHours.day)}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">
                                                            {t("Start Time")}
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={dayHours.startTime || ""}
                                                            onChange={(e) => {
                                                                const newStartTime = e.target.value;
                                                                handleDayWorkingHoursChange(dayHours.day, "startTime", newStartTime);

                                                                // Validate against end time
                                                                if (dayHours.endTime && !validateTimeOrder(newStartTime, dayHours.endTime)) {
                                                                    // Show warning or adjust end time
                                                                    console.warn("Start time cannot be after end time");
                                                                }
                                                            }}
                                                            disabled={!isEditing}
                                                            className={`w-full bg-secondary border rounded-lg px-3 py-2 text-twhite text-sm focus:outline-none disabled:opacity-50 ${dayHours.startTime && dayHours.endTime && !validateTimeOrder(dayHours.startTime, dayHours.endTime)
                                                                ? 'border-red-500 focus:border-red-500'
                                                                : 'border-gray-600 focus:border-blue-500'
                                                                }`}

                                                            onWheel={handleNumberInputWheel}
                                                            onKeyDown={handleNumberInputKeyDown}

                                                        />
                                                        {dayHours.startTime && dayHours.endTime && !validateTimeOrder(dayHours.startTime, dayHours.endTime) && (
                                                            <p className="text-red-400 text-xs mt-1">{t("Start time must be before end time")}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">
                                                            {t("End Time")}
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={dayHours.endTime || ""}
                                                            onChange={(e) => {
                                                                const newEndTime = e.target.value;
                                                                handleDayWorkingHoursChange(dayHours.day, "endTime", newEndTime);

                                                                // Validate against start time
                                                                if (dayHours.startTime && !validateTimeOrder(dayHours.startTime, newEndTime)) {
                                                                    console.warn("End time cannot be before start time");
                                                                }
                                                            }}
                                                            disabled={!isEditing}
                                                            className={`w-full bg-secondary border rounded-lg px-3 py-2 text-twhite text-sm focus:outline-none disabled:opacity-50 ${dayHours.startTime && dayHours.endTime && !validateTimeOrder(dayHours.startTime, dayHours.endTime)
                                                                ? 'border-red-500 focus:border-red-500'
                                                                : 'border-gray-600 focus:border-blue-500'
                                                                }`}

                                                            onWheel={handleNumberInputWheel}
                                                            onKeyDown={handleNumberInputKeyDown}

                                                        />
                                                        {dayHours.startTime && dayHours.endTime && !validateTimeOrder(dayHours.startTime, dayHours.endTime) && (
                                                            <p className="text-red-400 text-xs mt-1">{t("End time must be after start time")}</p>
                                                        )}
                                                    </div>



                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">
                                                            {t("Break Time (minutes)")}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={dayHours.breakTimeMinutes ?? ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === "") {
                                                                    handleDayWorkingHoursChange(dayHours.day, "breakTimeMinutes", undefined);
                                                                } else {
                                                                    const numValue = parseInt(value);
                                                                    if (!isNaN(numValue) && numValue >= 0) {
                                                                        handleDayWorkingHoursChange(dayHours.day, "breakTimeMinutes", numValue);
                                                                    }
                                                                }
                                                            }}
                                                            disabled={!isEditing}
                                                            className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                                            placeholder="0"
                                                            onWheel={handleNumberInputWheel}
                                                            onKeyDown={handleNumberInputKeyDown}

                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

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