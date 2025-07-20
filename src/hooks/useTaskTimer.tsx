import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { TimeLog } from "@/types/Task.type";
import { apiClient } from "@/utils/axios/usage";
import { useTranslation } from "react-i18next";

interface UseTaskTimerReturn {
    // Timer state
    elapsedTime: number;
    isRunning: boolean;
    totalTimeSpent: number;

    // Actions
    startTimer: () => Promise<{ success: boolean; message?: string }>;
    pauseTimer: () => Promise<{ success: boolean; message?: string }>;

    // Loading state
    isLoading: boolean;
}

/**
 * Ultra-perfect task timer hook
 * - Simple and reliable
 * - Single source of truth
 * - Automatic sync with backend
 * - Clean error handling
 * - Optimized performance
 */
const useTaskTimer = (taskId: string, timeLogs: TimeLog[] = []): UseTaskTimerReturn => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    // Core timer state
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    // Refs for cleanup and consistency
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Calculate initial state from timeLogs
    const calculateInitialState = useCallback(() => {
        if (!timeLogs || timeLogs.length === 0) {
            return { isRunning: false, elapsedTime: 0, totalTimeSpent: 0 };
        }

        // Find the last incomplete time log (running timer)
        const runningLog = timeLogs.find(log => log.start && !log.end);

        // Calculate total time spent from completed logs
        const completedTime = timeLogs
            .filter(log => log.start && log.end)
            .reduce((total, log) => {
                const start = new Date(log.start).getTime();
                const end = new Date(log.end!).getTime();
                return total + Math.floor((end - start) / 1000);
            }, 0);

        if (runningLog) {
            // Timer is running
            const startTime = new Date(runningLog.start).getTime();
            const currentElapsed = Math.floor((Date.now() - startTime) / 1000);

            return {
                isRunning: true,
                elapsedTime: currentElapsed,
                totalTimeSpent: completedTime,
                startTime
            };
        }

        return {
            isRunning: false,
            elapsedTime: 0,
            totalTimeSpent: completedTime
        };
    }, [timeLogs]);

    // Initialize state when timeLogs change
    useEffect(() => {
        const initialState = calculateInitialState();

        setIsRunning(initialState.isRunning);
        setElapsedTime(initialState.elapsedTime);
        setTotalTimeSpent(initialState.totalTimeSpent);

        if (initialState.isRunning && initialState.startTime) {
            startTimeRef.current = initialState.startTime;
        }
    }, [calculateInitialState]);

    // Timer interval effect
    useEffect(() => {
        if (isRunning && startTimeRef.current) {
            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning]);

    // API call helper
    // NOTE: This will always invalidate the ['tasks'] query (and others) after starting or pausing a timer.
    const makeApiCall = useCallback(async (action: 'start' | 'pause') => {
        try {
            const endpoint = action === 'start' ? `/tasks/start/${taskId}` : `/tasks/pause/${taskId}`;
            await apiClient.get(endpoint);

            // Invalidate all relevant queries for perfect sync
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["tasks"] }),
                queryClient.invalidateQueries({ queryKey: ["task", taskId] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard"] })
            ]);
            console.log("Forcing refetch of tasks query");
            await queryClient.refetchQueries({ queryKey: ["tasks"], exact: true });
            // Broadcast a custom event for instant UI updates
            window.dispatchEvent(new Event("task-timer-updated"));
            return { success: true };
        } catch (error) {
            console.error(`Error ${action}ing timer:`, error);
            return { success: false, error };
        }
    }, [taskId, queryClient]);

    // Start timer action
    const startTimer = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        try {
            const result = await makeApiCall('start');

            if (result.success) {
                setIsRunning(true);
                setElapsedTime(0);
                startTimeRef.current = Date.now();
                return { success: true };
            } else {
                return { success: false, message: t("Failed to start timer") };
            }
        } catch (error) {
            console.error("Error starting timer:", error);
            return { success: false, message: t("Failed to start timer") };
        } finally {
            setIsLoading(false);
        }
    }, [makeApiCall, t]);

    // Pause timer action
    const pauseTimer = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        try {
            const finalElapsed = elapsedTime;
            setIsRunning(false);
            setTotalTimeSpent(prev => prev + finalElapsed);
            setElapsedTime(0);
            startTimeRef.current = null;

            const result = await makeApiCall('pause');

            if (!result.success) {
                // Revert optimistic update on failure
                setIsRunning(true);
                setTotalTimeSpent(prev => prev - finalElapsed);
                setElapsedTime(finalElapsed);
                startTimeRef.current = Date.now() - (finalElapsed * 1000);
            }

            return result;
        } catch (error) {
            console.error("Error pausing timer:", error);
            return { success: false, message: t("Failed to pause timer") };
        } finally {
            setIsLoading(false);
        }
    }, [elapsedTime, makeApiCall, t]);

    return {
        elapsedTime,
        isRunning,
        totalTimeSpent,
        startTimer,
        pauseTimer,
        isLoading
    };
};

export default useTaskTimer; 