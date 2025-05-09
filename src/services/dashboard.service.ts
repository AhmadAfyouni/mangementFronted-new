// src/services/dashboard.service.ts
import { DailyTask, DashboardData, DashboardParamsDto, MessagePreview, MyTask, ProjectStats, RecentActivity, TaskSummary, TimeTracking } from "@/types/dashboard.type";
import { apiClient } from "@/utils/axios/usage";

export const useDashboardService = () => {

    // Helper function to build query params
    const buildQueryParams = (params: DashboardParamsDto): string => {
        const queryParams = [];

        if (params.timeRange) {
            queryParams.push(`timeRange=${encodeURIComponent(params.timeRange)}`);
        }

        if (params.projectId) {
            queryParams.push(`projectId=${encodeURIComponent(params.projectId)}`);
        }

        if (params.departmentId) {
            queryParams.push(`departmentId=${encodeURIComponent(params.departmentId)}`);
        }

        return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    };

    return {
        // Get all dashboard data
        getDashboardData: async (params: DashboardParamsDto = {}): Promise<DashboardData> => {
            try {
                const queryString = buildQueryParams(params);
                const data = await apiClient.get<DashboardData>(`/dashboard${queryString}`);
                return data;
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                throw error;
            }
        },

        // Get task summary
        getTaskSummary: async (params: DashboardParamsDto = {}): Promise<TaskSummary> => {
            try {
                const queryString = buildQueryParams(params);
                const data = await apiClient.get<TaskSummary>(`/dashboard/task-summary${queryString}`);
                return data;
            } catch (error) {
                console.error("Error fetching task summary:", error);
                throw error;
            }
        },

        // Get time tracking
        getTimeTracking: async (params: DashboardParamsDto = {}): Promise<TimeTracking> => {
            try {
                const queryString = buildQueryParams(params);
                const data = await apiClient.get<TimeTracking>(`/dashboard/time-tracking${queryString}`);
                return data;
            } catch (error) {
                console.error("Error fetching time tracking:", error);
                throw error;
            }
        },



        // Get daily tasks
        getDailyTasks: async (): Promise<DailyTask[]> => {
            try {
                const data = await apiClient.get<DailyTask[]>('/dashboard/daily-tasks');
                return data;
            } catch (error) {
                console.error("Error fetching daily tasks:", error);
                throw error;
            }
        },

        // Get project stats
        getProjectStats: async (params: DashboardParamsDto = {}): Promise<ProjectStats[]> => {
            try {
                const queryString = buildQueryParams(params);
                const data = await apiClient.get<ProjectStats[]>(`/dashboard/project-stats${queryString}`);
                return data;
            } catch (error) {
                console.error("Error fetching project stats:", error);
                throw error;
            }
        },

        // Get my tasks
        getMyTasks: async (): Promise<MyTask[]> => {
            try {
                const data = await apiClient.get<MyTask[]>('/dashboard/my-tasks');
                return data;
            } catch (error) {
                console.error("Error fetching my tasks:", error);
                throw error;
            }
        },

        // Get recent activity
        getRecentActivity: async (): Promise<RecentActivity[]> => {
            try {
                const data = await apiClient.get<RecentActivity[]>('/dashboard/recent-activity');
                return data;
            } catch (error) {
                console.error("Error fetching recent activity:", error);
                throw error;
            }
        },

        // Get messages
        getMessages: async (): Promise<MessagePreview[]> => {
            try {
                const data = await apiClient.get<MessagePreview[]>('/dashboard/messages');
                return data;
            } catch (error) {
                console.error("Error fetching messages:", error);
                throw error;
            }
        }
    };
};