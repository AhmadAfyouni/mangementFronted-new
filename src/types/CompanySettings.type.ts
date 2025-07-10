// Types, interfaces, and enums for company settings and working hours

export enum WorkDay {
    SUNDAY = 'Sunday',
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday'
}

export enum ProgressCalculationMethod {
    TIME_BASED = 'time_based',
    DATE_BASED = 'date_based'
}

export interface DayWorkingHours {
    day: WorkDay;
    isWorkingDay: boolean;
    startTime?: string;
    endTime?: string;
    breakTimeMinutes?: number | undefined;
}

export interface TaskFieldSettings {
    enableEstimatedTime?: boolean;
    enablePriority?: boolean;
    enableDueDate?: boolean;
    enableFiles?: boolean;
    enableComments?: boolean;
    enableSubTasks?: boolean;
    enableTimeTracking?: boolean;
    enableRecurring?: boolean;
}

export interface WorkSettings {
    dayWorkingHours?: DayWorkingHours[];
    holidays?: string[];
    timezone?: string;
    overtimeRate?: number;
    defaultBreakTimeMinutes?: number | undefined;
}

export interface CompanySettings {
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
    isFirstTime?: boolean;
}

export interface WorkingHoursTimelineProps {
    dayWorkingHours: DayWorkingHours[];
    onDayWorkingHoursChange: (day: WorkDay, field: keyof DayWorkingHours, value: string | number | boolean | undefined) => void;
    onWorkDayToggle: (day: WorkDay) => void;
    isEditing: boolean;
    t: (key: string) => string;
    companySettings?: CompanySettings;
    workingHoursErrors: Record<WorkDay, string>;
}



// sad



export interface DayWorkingHours {
    day: WorkDay;
    isWorkingDay: boolean;
    startTime?: string;
    endTime?: string;
    breakTimeMinutes?: number | undefined;
}

export interface TaskFieldSettings {
    enableEstimatedTime?: boolean;
    enablePriority?: boolean;
    enableDueDate?: boolean;
    enableFiles?: boolean;
    enableComments?: boolean;
    enableSubTasks?: boolean;
    enableTimeTracking?: boolean;
    enableRecurring?: boolean;
}

export interface WorkSettings {
    dayWorkingHours?: DayWorkingHours[];
    holidays?: string[];
    timezone?: string;
    overtimeRate?: number;
    defaultBreakTimeMinutes?: number | undefined;
}

export interface CompanySettingsType {
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
    isFirstTime?: boolean
}