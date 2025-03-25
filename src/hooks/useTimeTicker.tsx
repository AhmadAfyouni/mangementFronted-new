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
import { useEffect, useState, useCallback } from "react";

const useTimeTicker = (taskId: string, timeLogs: TimeLog[]) => {
  const { timers, isRunning, startTimer, pauseTimer, setElapsedTime } =
    useTaskTimer();
  const queryClient = useQueryClient();
  const [isMakingAPICall, setIsMakingAPICall] = useState(false);

  const stableSetElapsedTime = useCallback(setElapsedTime, []);
  const stableStartTimer = useCallback(startTimer, []);
  const stablePauseTimer = useCallback(pauseTimer, []);

  useEffect(() => {
    const fetchTaskState = async () => {
      try {
        if (timeLogs.length > 0) {
          const lastLog = timeLogs[timeLogs.length - 1];

          if (lastLog.start && !lastLog.end) {
            const elapsed = Math.floor(
              (Date.now() - new Date(lastLog.start).getTime()) / 1000
            );

            stableSetElapsedTime(taskId, elapsed);
            stableStartTimer(taskId);
          } else {
            stableSetElapsedTime(taskId, 0);
            stablePauseTimer(taskId);
          }
        } else {
          stableSetElapsedTime(taskId, 0);
          stablePauseTimer(taskId);
        }
      } catch (error) {
        console.error("Failed to fetch task state:", error);
      }
    };

    fetchTaskState();
  }, [
    taskId,
    timeLogs,
    stableSetElapsedTime,
    stableStartTimer,
    stablePauseTimer,
  ]);

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
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }

      setIsMakingAPICall(false);
      return { success: true };
    } catch (err) {
      setIsMakingAPICall(false);
      return { success: false, error: err };
    }
  };

  const startTaskTicker = async () => {
    setIsMakingAPICall(true);

    const response = await makeApiCall("start");
    if (response.success) {
      stableStartTimer(taskId);
    }
    return response;
  };

  const pauseTaskTicker = async () => {
    setIsMakingAPICall(true);

    const response = await makeApiCall("pause");
    if (response.success) {
      stablePauseTimer(taskId);
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
