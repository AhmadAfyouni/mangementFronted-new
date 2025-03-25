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
import React, { useState } from "react";
import PageSpinner from "../ui/PageSpinner";
import ListTaskDetails, { formatTime } from "./ListTaskDetails";

const ListRow: React.FC<{
  task: ReceiveTaskType;
  level: number;
}> = ({ task, level }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  return (
    <>
      <div
        style={{
          marginRight: currentLanguage === "ar" ? `${level * 20}px` : undefined,
          marginLeft: currentLanguage === "en" ? `${level * 20}px` : undefined,
        }}
      >
        <div
          className={` ${
            isLightMode
              ? "bg-secondary  hover:bg-darker "
              : "bg-dark  hover:bg-slate-700"
          }  flex flex-col md:flex-row items-center justify-between w-full cursor-pointer my-1 px-5 group  !rounded-md ${
            currentLanguage == "en" ? " border-l-4 " : " border-r-4"
          } ${getPriorityBorderColor(task.priority)}  `}
        >
          <div
            onClick={() => setIsModalOpen((prev) => !prev)}
            className={` w-full  flex items-center  gap-2  px-6 py-4 text-twhite  ${
              isLightMode
                ? "group-hover:text-tblackAF"
                : "group-hover:text-twhite"
            }  `}
          >
            <Image
              src={task.parent_task ? SubtasksIcon : TasksIcon}
              alt="task icon"
              height={20}
              width={20}
              className={
                isLightMode ? `bg-darker w-[25px] h-[25px] p-1 rounded-md` : ""
              }
            />
            {task.name}
          </div>
          <div
            onClick={() => setIsModalOpen((prev) => !prev)}
            className={` w-full  px-6 py-4  text-center ${
              isLightMode
                ? "group-hover:text-tblackAF"
                : "group-hover:text-twhite"
            }   ${task.is_over_due ? "text-red-500" : "text-tdark"} ${
              isDueSoon(task.due_date) ? "flash" : ""
            }`}
          >
            {formatDate(task.due_date, currentLanguage as "en" | "ar")}
          </div>
          <div
            onClick={() => setIsModalOpen((prev) => !prev)}
            className={`w-full   px-6 py-4 text-tdark ${
              isLightMode
                ? "group-hover:text-tblackAF"
                : "group-hover:text-twhite"
            }  text-center `}
          >
            {t(task.status)}
          </div>

          {
            <div className=" w-full px-6 py-4 flex items-center justify-center">
              <span
                className={`  text-tdark ${
                  isLightMode
                    ? "group-hover:text-tblackAF"
                    : "group-hover:text-twhite"
                }  px-2 py-1 rounded text-xs cursor-pointer`}
              >
                {task?.status == "DONE"
                  ? formatTime(task?.totalTimeSpent || 0)
                  : formatTime(elapsedTime)}
              </span>
              {userId == task?.emp.id && (
                <>
                  {task?.status == "DONE" ? (
                    <span className="bg-secondary text-twhite px-2 py-1 rounded text-xs cursor-not-allowed flex items-center gap-1">
                      <Image
                        src={CheckIcon}
                        alt="start icon"
                        width={15}
                        height={15}
                      />{" "}
                      {t("Completed")}
                    </span>
                  ) : (
                    <span
                      className={`${
                        isLightMode ? "bg-dark" : "bg-secondary"
                      }  text-twhite px-2 py-1 rounded text-xs cursor-pointer flex items-center gap-4`}
                    >
                      {isMakingAPICall ? (
                        <PageSpinner />
                      ) : !isTaskRunning ? (
                        <div
                          className="flex  items-center gap-1"
                          onClick={async () => {
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
                            alt="start icon"
                            width={15}
                            height={15}
                          />{" "}
                          {t("Start")}
                        </div>
                      ) : (
                        <div
                          className="flex  items-center gap-1"
                          onClick={async () => {
                            await pauseTaskTicker();
                          }}
                        >
                          <Image
                            src={PauseIcon}
                            alt="pause icon"
                            width={15}
                            height={15}
                          />{" "}
                          {t("Pause")}
                        </div>
                      )}
                    </span>
                  )}
                </>
              )}
            </div>
          }
        </div>
      </div>
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <ListTaskDetails
            task={task}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default ListRow;
