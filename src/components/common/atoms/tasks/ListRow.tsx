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
import useTaskTimer from "@/hooks/useTaskTimer";
import {
  formatDate,
  getPriorityBorderColor,
  isDueSoon,
} from "@/services/task.service";
import { ExtendedReceiveTaskType } from "@/types/Task.type";
import { Clock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import PageSpinner from "../ui/PageSpinner";

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const ListRow: React.FC<{
  task: ExtendedReceiveTaskType;
  level: number;
  sectionName?: string;
}> = ({ task, level, sectionName }) => {
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();
  const { setSnackbarConfig } = useMokkBar();
  const { isLightMode } = useCustomTheme();
  const {
    elapsedTime,
    isRunning,
    pauseTimer,
    startTimer,
    isLoading,
  } = useTaskTimer(task.id, task.timeLogs);

  console.log("is loading : ", isLoading);

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
      className={`hidden md:grid grid-cols-5 bg-dark hover:bg-secondary/50 cursor-pointer transition-all duration-300 ${isRTL ? "border-r-4" : "border-l-4"
        } ${getPriorityBorderColor(task.priority)} my-1 hover:shadow-md hover:shadow-black/20 group`}
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
          <span className="text-twhite font-medium group-hover:text-blue-300 transition-colors duration-300">{task.name}</span>
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

      {/* Section */}
      <div
        className="flex items-center py-4 px-6"
      >
        <span className="text-sm text-orange-400 font-medium">
          {sectionName || t("Unknown Section")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-4 px-6">
        <div className="flex items-center space-x-3">
          <div className="bg-secondary/30 px-3 py-1.5 rounded-lg  shadow shadow-black/20 hover:bg-secondary/40 transition-all duration-300">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  {formatTime(task?.totalTimeSpent || 0)}
                </span>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot"></div>
                  <span className="text-xs text-green-400">
                    {formatTime(elapsedTime)} {t("running")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {
            // userId === task?.emp.id && task?.status !== "DONE" &&

            (
              <div className="flex space-x-1">
                {!isRunning ? (
                  <button
                    disabled={isLoading
                      // || task?.status !== "ONGOING"
                    }
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${!isLoading
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                      : "bg-gray-700/40 text-gray-500 cursor-not-allowed"
                      }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (task?.status === "ONGOING") {
                        try {
                          const result = await startTimer();
                          if (!result.success) {
                            setSnackbarConfig({
                              message: t("Failed to start the timer. Please try again."),
                              open: true,
                              severity: "error",
                            });
                          }
                        } catch (error) {
                          console.error("Error starting timer:", error);
                          setSnackbarConfig({
                            message: t("Failed to start the timer. Please try again."),
                            open: true,
                            severity: "error",
                          });
                        }
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
                    <span className="text-sm font-medium">{t("Start")}</span>
                  </button>
                ) : (
                  <button
                    // disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-md hover:shadow-red-500/10 flex items-center gap-1.5 transition-all duration-300"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const result = await pauseTimer();
                        if (!result.success) {
                          setSnackbarConfig({
                            message: t("Failed to pause the timer. Please try again."),
                            open: true,
                            severity: "error",
                          });
                        }
                      } catch (error) {
                        console.error("Error pausing timer:", error);
                        setSnackbarConfig({
                          message: t("Failed to pause the timer. Please try again."),
                          open: true,
                          severity: "error",
                        });
                      }
                    }}
                  >
                    {isLoading ? (
                      <PageSpinner size="small" />
                    ) : (
                      <>
                        <Image
                          src={PauseIcon}
                          alt="pause icon"
                          width={15}
                          height={15}
                        />
                        <span className="text-sm font-medium">{t("Pause")}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
        </div>

        {task?.status === "DONE" && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm border border-green-500/20 shadow-sm shadow-green-500/10 transition-all duration-300 hover:bg-green-500/30">
            <Image
              src={CheckIcon}
              alt="check icon"
              width={15}
              height={15}
            />
            <span className="font-medium">{t("Completed")}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ListRow;
