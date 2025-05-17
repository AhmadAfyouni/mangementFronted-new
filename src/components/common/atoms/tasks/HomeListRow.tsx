"use client";

import { SubtasksIcon, TasksIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import {
  formatDate,
  getPriorityBorderColor,
  isDueSoon,
} from "@/services/task.service";
import { ExtendedReceiveTaskType } from "@/types/Task.type";
import Image from "next/image";
import React, { useState } from "react";
import ListTaskDetails from "./ListTaskDetails";
const HomeListRow: React.FC<{
  task: ExtendedReceiveTaskType;
  level: number;
}> = ({ task, level }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, currentLanguage } = useLanguage();
  const { isLightMode } = useCustomTheme();
  return (
    <>
      <div
        style={{
          marginRight: currentLanguage === "ar" ? `${level * 20}px` : undefined,
          marginLeft: currentLanguage === "en" ? `${level * 20}px` : undefined,
        }}
      >
        <div
          className={`
          
          
          ${isLightMode ? "hover:bg-darker" : "hover:bg-tblack"}
          group bg-dark flex flex-col md:flex-row items-center justify-center sm:justify-between w-full cursor-pointer my-1 px-5  flex-nowrap !rounded-md ${currentLanguage == "en" ? " border-l-4 " : " border-r-4"
            } ${getPriorityBorderColor(task.priority)}  `}
          onClick={() => setIsModalOpen((prev) => !prev)}
        >
          <div
            className={` w-1/2  flex items-center  gap-2  px-6 py-4 text-twhite       ${isLightMode
              ? "group-hover:text-tblackAF"
              : "group-hover:text-twhite"
              }   `}
          >
            <Image
              src={task.parent_task ? SubtasksIcon : TasksIcon}
              alt="task icon"
              height={20}
              width={20}
              className={
                isLightMode ? `bg-darker w-[25px] h-[25px] p-1 rounded-md` : ""
              }
            />{""}
            {task.name}
          </div>

          <div
            className={`px-6 py-4 text-tdark      ${isLightMode
              ? "group-hover:text-tblackAF"
              : "group-hover:text-twhite"
              }   `}
          >
            {t(task.status)}
            <span
              className={`px-6 py-4       ${isLightMode
                ? "group-hover:text-tblackAF"
                : "group-hover:text-twhite"
                }   ${task.is_over_due ? "text-red-500" : "text-tdark"} ${isDueSoon(task.due_date) ? "flash" : ""
                }`}
            >
              {formatDate(task.due_date, currentLanguage as "ar" | "en")}
            </span>
          </div>
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

export default HomeListRow;
