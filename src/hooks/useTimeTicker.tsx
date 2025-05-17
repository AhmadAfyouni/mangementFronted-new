/* eslint-disable react-hooks/exhaustive-deps */
// import { useTaskTimer } from "@/components/Providers/TaskTimerContext";
// import { TimeLog } from "@/types/task.type";
// import { useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";

// const useTimeTicker = (taskId: string, timeLogs: TimeLog[]) => {
//   const { timers, isRunning, startTimer, pauseTimer, setElapsedTime } =
//     useTaskTimer();
//   const queryClient = useQueryClient();
//   const [isMakingAPICall, setIsMakingAPICall] = useState(false);

//   useEffect(() => {
//     const fetchTaskState = async () => {
//       try {
//         if (timeLogs.length > 0) {
//           const lastLog = timeLogs[timeLogs.length - 1];

//           if (lastLog.start && !lastLog.end) {
//             const elapsed = Math.floor(
//               (Date.now() - new Date(lastLog.start).getTime()) / 1000
//             );

//             setElapsedTime(taskId, elapsed);
//             startTimer(taskId);
//           } else {
//             setElapsedTime(taskId, 0);
//             pauseTimer(taskId);
//           }
//         } else {
//           setElapsedTime(taskId, 0);
//           pauseTimer(taskId);
//         }
//       } catch (error) {
//         console.error("Failed to fetch task state:", error);
//       }
//     };

//     fetchTaskState();
//   }, [taskId, timeLogs, setElapsedTime, startTimer, pauseTimer]); // Ensure these are stable

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (isRunning[taskId]) {
//       timer = setInterval(() => {
//         setElapsedTime(taskId, (timers[taskId] || 0) + 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [isRunning, setElapsedTime, taskId, timers]);

//   const makeApiCall = async (endpoint: string) => {
//     setIsMakingAPICall(true);
//     try {
//       const token = Cookies.get("access_token");
//       if (!token) {
//         throw new Error("Authentication token not found.");
//       }

//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/tasks/${endpoint}/${taskId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (response.status == 200) {
//         console.log("invalidating after updated");

//         queryClient.invalidateQueries({
//           queryKey: ["tasks"],
//         });
//         setIsMakingAPICall(false);
//       }

//       return { success: true };
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       setIsMakingAPICall(false);

//       return { success: false, error: err };
//     }
//   };

//   const startTaskTicker = async () => {
//     const response = await makeApiCall("start");
//     if (response.success) {
//       // setIsTaskRunning(true);
//       startTimer(taskId);
//     }
//     return response;
//   };

//   const pauseTaskTicker = async () => {
//     const response = await makeApiCall("pause");
//     if (response.success) {
//       pauseTimer(taskId);
//     }
//     return response;
//   };

//   return {
//     elapsedTime: timers[taskId] || 0,
//     isTaskRunning: isRunning[taskId] || false,
//     startTaskTicker,
//     pauseTaskTicker,
//     isMakingAPICall,
//   };
// };

// export default useTimeTicker;

import { useTaskTimer } from "@/components/Providers/TaskTimerContext";
import { TimeLog } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState, useCallback, useRef } from "react";

const useTimeTicker = (taskId: string, timeLogs: TimeLog[]) => {
  const { timers, isRunning, startTimer, pauseTimer, setElapsedTime, resetTimerState } =
    useTaskTimer();
  const queryClient = useQueryClient();
  const [isMakingAPICall, setIsMakingAPICall] = useState(false);
  
  // Store the initial state for failures
  const initialStateRef = useRef({
    isRunning: false,
    lastTimeLogWithNoEnd: null as TimeLog | null,
    totalTimeSpent: 0
  });

  const stableSetElapsedTime = useCallback(setElapsedTime, []);
  const stableStartTimer = useCallback(startTimer, []);
  const stablePauseTimer = useCallback(pauseTimer, []);
  const stableResetTimerState = useCallback(resetTimerState, []);

  // Initialize the timer state based on timeLogs
  useEffect(() => {
    const fetchTaskState = async () => {
      try {
        let lastLogWithNoEnd = null;
        let isActiveTimer = false;
        
        if (timeLogs && timeLogs.length > 0) {
          // Find the last timeLog that has a start but no end (active timer)
          for (let i = timeLogs.length - 1; i >= 0; i--) {
            if (timeLogs[i].start && !timeLogs[i].end) {
              lastLogWithNoEnd = timeLogs[i];
              isActiveTimer = true;
              break;
            }
          }

          // Store the initial state for reference in case of API failures
          initialStateRef.current = {
            isRunning: isActiveTimer,
            lastTimeLogWithNoEnd: lastLogWithNoEnd,
            totalTimeSpent: 0
          };

          if (isActiveTimer && lastLogWithNoEnd) {
            const elapsed = Math.floor(
              (Date.now() - new Date(lastLogWithNoEnd.start).getTime()) / 1000
            );

            stableSetElapsedTime(taskId, elapsed);
            stableStartTimer(taskId);
          } else {
            stableSetElapsedTime(taskId, 0);
            stablePauseTimer(taskId);
          }
        } else {
          initialStateRef.current = {
            isRunning: false,
            lastTimeLogWithNoEnd: null,
            totalTimeSpent: 0
          };
          stableSetElapsedTime(taskId, 0);
          stablePauseTimer(taskId);
        }
      } catch (error) {
        console.error("Failed to fetch task state:", error);
        stableResetTimerState(taskId);
      }
    };

    fetchTaskState();
  }, [
    taskId,
    timeLogs,
    stableSetElapsedTime,
    stableStartTimer,
    stablePauseTimer,
    stableResetTimerState
  ]);

  // Update the timer every second if running
  useEffect(() => {
    if (!isRunning[taskId]) return;

    let timer: NodeJS.Timeout;

    // eslint-disable-next-line prefer-const
    timer = setInterval(() => {
      stableSetElapsedTime(taskId, (timers[taskId] || 0) + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning[taskId], taskId, timers, stableSetElapsedTime]);

  const makeApiCall = async (endpoint: string) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/tasks/${endpoint}/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        console.log("Invalidating after update");
        // Invalidate both task and tasks queries to ensure we get fresh data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      }

      setIsMakingAPICall(false);
      return { success: true };
    } catch (err) {
      console.error(`Error calling ${endpoint} API:`, err);
      setIsMakingAPICall(false);
      return { success: false, error: err };
    }
  };

  // Start the timer for a task
  const startTaskTicker = async () => {
    setIsMakingAPICall(true);

    const response = await makeApiCall("start");
    if (response.success) {
      stableStartTimer(taskId);
    } else {
      // If API call fails, revert to the original state
      if (!initialStateRef.current.isRunning) {
        stablePauseTimer(taskId);
      }
      // Ensure the UI reflects the correct state by re-fetching data
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
    return response;
  };

  // Pause the timer for a task
  const pauseTaskTicker = async () => {
    setIsMakingAPICall(true);

    const response = await makeApiCall("pause");
    if (response.success) {
      stablePauseTimer(taskId);
    } else {
      // If API call fails, revert to the original state
      if (initialStateRef.current.isRunning) {
        stableStartTimer(taskId);
      }
      // Ensure the UI reflects the correct state by re-fetching data
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
    return response;
  };

  return {
    elapsedTime: timers[taskId] || 0,
    isTaskRunning: isRunning[taskId] || false,
    startTaskTicker,
    pauseTaskTicker,
    isMakingAPICall,
  };
};

export default useTimeTicker;
