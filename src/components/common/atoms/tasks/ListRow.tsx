"use client";

import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  SubtasksIcon,
  TasksIcon,
} from "@/assets";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import useTimeTicker from "@/hooks/useTimeTicker";
import {
  formatDate,
  getPriorityBorderColor,
  isDueSoon,
} from "@/services/task.service";
import { RootState } from "@/state/store";
import { ReceiveTaskType } from "@/types/Task.type";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import PageSpinner from "../ui/PageSpinner";
import { User, Clock } from "lucide-react";

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const ListRow: React.FC<{
  task: ReceiveTaskType;
  level: number;
}> = ({ task, level }) => {
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();
  const { setSnackbarConfig } = useMokkBar();
  const { isLightMode } = useCustomTheme();
  const {
    elapsedTime,
    isTaskRunning,
    pauseTaskTicker,
    startTaskTicker,
    isMakingAPICall,
  } = useTimeTicker(task.id, task.timeLogs);
  const { selector: userId } = useRedux(
    (state: RootState) => state.user.userInfo?.id
  );

  const handleTaskClick = () => {
    router.push(`/tasks/${task.id}`);
  };

  const isRTL = currentLanguage === "ar";

  const getPaddingStyle = () => {
    if (isRTL) {
      return { paddingRight: `${level * 24 + 24}px`, paddingLeft: '24px' };
    }
    return { paddingLeft: `${level * 24 + 24}px`, paddingRight: '24px' };
  };

  const getStatusStyles = () => {
    if (task.status === "DONE") return "text-green-400";
    if (task.status === "ONGOING") return "text-blue-400";
    if (task.status === "ON_TEST") return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div
      className={`grid grid-cols-4 bg-dark hover:bg-secondary/50 cursor-pointer ${isRTL ? "border-r-4" : "border-l-4"
        } ${getPriorityBorderColor(task.priority)} my-1`}
      onClick={handleTaskClick}
    >
      {/* Task Name */}
      <div
        className="flex items-center gap-3 py-4"
        style={getPaddingStyle()}
      >
        <Image
          src={task.parent_task ? SubtasksIcon : TasksIcon}
          alt="task icon"
          height={20}
          width={20}
          className={isLightMode ? `bg-darker w-[25px] h-[25px] p-1 rounded-md` : ""}
        />
        <div className="flex-1">
          <span className="text-twhite font-medium">{task.name}</span>
          {task.assignee && (
            <div className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{task.assignee.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div
        className="flex items-center py-4 px-6"
      >
        <span className={`text-sm ${task.is_over_due ? "text-red-500" : "text-gray-400"
          } ${isDueSoon(task.due_date) ? "animate-pulse" : ""}`}>
          {formatDate(task.due_date, currentLanguage as "en" | "ar")}
        </span>
      </div>

      {/* Status */}
      <div
        className="flex items-center py-4 px-6"
      >
        <span className={`text-sm font-medium ${getStatusStyles()}`}>
          {t(task.status)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 py-4 px-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {task?.status === "DONE"
              ? formatTime(task?.totalTimeSpent || 0)
              : formatTime(elapsedTime)}
          </span>
        </div>

        {userId === task?.emp.id && (
          <>
            {task?.status === "DONE" ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">
                <Image
                  src={CheckIcon}
                  alt="check icon"
                  width={15}
                  height={15}
                />
                {t("Completed")}
              </span>
            ) : (
              <span
                className={`${isLightMode ? "bg-dark" : "bg-secondary"
                  } text-twhite px-3 py-1 rounded-lg text-sm cursor-pointer flex items-center gap-2`}
              >
                {isMakingAPICall ? (
                  <PageSpinner />
                ) : !isTaskRunning ? (
                  <div
                    className="flex items-center gap-1"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (task?.status === "ONGOING") {
                        await startTaskTicker();
                      } else {
                        setSnackbarConfig({
                          message: t("Task Status must be ONGOING"),
                          open: true,
                          severity: "warning",
                        });
                      }
                    }}
                  >
                    <Image
                      src={PlayIcon}
                      alt="play icon"
                      width={15}
                      height={15}
                    />
                    {t("Start")}
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await pauseTaskTicker();
                    }}
                  >
                    <Image
                      src={PauseIcon}
                      alt="pause icon"
                      width={15}
                      height={15}
                    />
                    {t("Pause")}
                  </div>
                )}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListRow;
