// src/hooks/useDashboard.ts
import { useDashboardService } from "@/services/dashboard.service";
import { DashboardParamsDto } from "@/types/dashboard.type";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = () => {
    const dashboardService = useDashboardService();

    // Query keys
    const dashboardKeys = {
        all: ["dashboard"] as const,
        data: (params: DashboardParamsDto = {}) =>
            [...dashboardKeys.all, "data", JSON.stringify(params)] as const,
        taskSummary: (params: DashboardParamsDto = {}) =>
            [...dashboardKeys.all, "taskSummary", JSON.stringify(params)] as const,
        timeTracking: (params: DashboardParamsDto = {}) =>
            [...dashboardKeys.all, "timeTracking", JSON.stringify(params)] as const,
        dailyTasks: () => [...dashboardKeys.all, "dailyTasks"] as const,
        projectStats: (params: DashboardParamsDto = {}) =>
            [...dashboardKeys.all, "projectStats", JSON.stringify(params)] as const,
        myTasks: () => [...dashboardKeys.all, "myTasks"] as const,
        recentActivity: () => [...dashboardKeys.all, "recentActivity"] as const,
        messages: () => [...dashboardKeys.all, "messages"] as const,
    };

    // Dashboard queries
    const useDashboardData = (params: DashboardParamsDto = {}) => {
        return useQuery({
            queryKey: dashboardKeys.data(params),
            queryFn: () => dashboardService.getDashboardData(params),
        });
    };

    const useTaskSummary = (params: DashboardParamsDto = {}) => {
        return useQuery({
            queryKey: dashboardKeys.taskSummary(params),
            queryFn: () => dashboardService.getTaskSummary(params),
        });
    };

    const useTimeTracking = (params: DashboardParamsDto = {}) => {
        return useQuery({
            queryKey: dashboardKeys.timeTracking(params),
            queryFn: () => dashboardService.getTimeTracking(params),
        });
    };

    const useDailyTasks = () => {
        return useQuery({
            queryKey: dashboardKeys.dailyTasks(),
            queryFn: () => dashboardService.getDailyTasks(),
        });
    };

    const useProjectStats = (params: DashboardParamsDto = {}) => {
        return useQuery({
            queryKey: dashboardKeys.projectStats(params),
            queryFn: () => dashboardService.getProjectStats(params),
        });
    };

    const useMyTasks = () => {
        return useQuery({
            queryKey: dashboardKeys.myTasks(),
            queryFn: () => dashboardService.getMyTasks(),
        });
    };

    const useRecentActivity = () => {
        return useQuery({
            queryKey: dashboardKeys.recentActivity(),
            queryFn: () => dashboardService.getRecentActivity(),
        });
    };

    const useMessages = () => {
        return useQuery({
            queryKey: dashboardKeys.messages(),
            queryFn: () => dashboardService.getMessages(),
        });
    };

    return {
        // Dashboard data queries
        useDashboardData,
        useTaskSummary,
        useTimeTracking,
        useDailyTasks,
        useProjectStats,
        useMyTasks,
        useRecentActivity,
        useMessages,

        // Query keys for manual invalidation if needed
        dashboardKeys,
    };
};