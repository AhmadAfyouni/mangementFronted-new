// src/types/api-types/dashboard.type.ts

import { TimeLog } from "./Task.type";

export enum TimeRange {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

export interface DashboardParamsDto {
    timeRange?: TimeRange;
    projectId?: string;
    departmentId?: string;
}

export interface TaskSummary {
    total: number;
    inProgress: number;
    completed: number;
    pending: number;
}



export interface TimeTracking {
    totalTimeToday: string; // HH:MM:SS format
    workedHours: number;    // Total task work hours
    breakTime: number;      // Break hours
    overtimeHours: number;  // Overtime hours
    overtimeRate: number;   // Overtime rate percentage
    hoursByDay: {
        date: string;
        plannedHours: number;
        actualHours: number;
    }[];
}


export interface DailyTask {
    id: string;
    name: string;
    dueTime: string;
    priority: string;
    status: string;
    timeLogs?: TimeLog[];

}

export interface ProjectStats {
    id: string;
    name: string;
    progress: number;
    tasksCount: number;
    hoursSpent: number
}

export interface MyTask {
    id: string;
    name: string;
    project: string;
    status: "PENDING" | "ONGOING" | "DONE";
    dueDate: string;
    timeSpent: number;
    progress: number;
    commentsCount: number;
    filesCount: number;

}

export interface RecentActivity {
    id: string;
    type: 'comment' | 'status_change' | 'task_created' | 'file_upload' | 'timer_action';
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    taskId: string;
    taskName: string;
    timestamp: Date;
}

export interface MessagePreview {
    id: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
        isOnline: boolean;
    };
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
}

export interface TimelineEntry {
    taskId: string;
    taskName: string;
    projectId: string;
    projectName: string;
    startTime: string;
    endTime: string;
    duration: number;
    position: number;
    width: number;
}

export interface DailyTimelineResponse {
    entries: TimelineEntry[];
    totalWorkingTime: number;
    totalBreakTime: number;
    shiftStart: string;
    shiftEnd: string;
}

export interface DashboardData {
    taskSummary: TaskSummary;
    timeTracking: TimeTracking;
    dailyTasks: DailyTask[];
    projectStats: ProjectStats[];
    myTasks: MyTask[];
    recentActivities: RecentActivity[];
    messages: MessagePreview[];
    dailyTimeline: DailyTimelineResponse;
}

