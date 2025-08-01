/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import {
  CalendarIcon,
  CalendarRedIcon,
  CheckIcon,
  PaperClipIcon,
  PaperPlaneIcon,
  PauseIcon,
  PlayIcon,
  SubtasksIcon,
} from "@/assets";
import StarRating from "@/components/common/atoms/tasks/StarsRating";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useComments from "@/hooks/useComments";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import useTaskTimer from "@/hooks/useTaskTimer";
import {
  formatDate,
  getPriorityColor,
  isDueSoon,
  updateTaskData,
} from "@/services/task.service";
import { RootState } from "@/state/store";
import { ExtendedReceiveTaskType, ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import AddSubTaskModal from "../modals/AddSubTaskModal";
import PageSpinner from "../ui/PageSpinner";
import { TimeLogSection } from "@/components/common/atoms/tasks/TimeLogSection";
import TaskStatusConfirmationModal from "../modals/TaskStatusConfirmationModal";
export const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const ListTaskDetails: React.FC<{
  isOpen: boolean;
  onClose: (e: React.MouseEvent<HTMLDivElement>) => void;
  task?: ExtendedReceiveTaskType;
}> = ({ onClose, task, isOpen }) => {
  const priorityOptions: ("LOW" | "MEDIUM" | "HIGH" | undefined)[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
  ];

  // Conditionally show DONE, CLOSED, CANCELED only when task is ON_TEST
  const currentTaskStatus = selectedStatus || task?.status;
  const statusOptions: (string | undefined)[] = currentTaskStatus === "ON_TEST"
    ? ["PENDING", "ONGOING", "ON_TEST", "DONE", "CLOSED", "CANCELED"]
    : ["PENDING", "ONGOING", "ON_TEST"];

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isStatusConfirmationModalOpen, setIsStatusConfirmationModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<"DONE" | "CLOSED" | "CANCELED" | null>(null);

  const { selector: userId } = useRedux(
    (state: RootState) => state.user.userInfo?.id
  );
  const isPrimary = useRolePermissions("primary_user");
  const isAdmin = useRolePermissions("admin");
  const calRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [calendar, setCalendar] = useState<string | undefined>(task?.due_date);
  const [isPriorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | undefined
  >(task?.priority);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    task?.status
  );

  const {
    startTimer,
    pauseTimer,
    elapsedTime,
    isRunning,
    isLoading,
  } = useTaskTimer(task!.id, task?.timeLogs);

  // Add a new state to track display time
  const [displayTime, setDisplayTime] = useState(
    task?.status === "DONE" ? task?.totalTimeSpent || 0 : elapsedTime
  );

  useEffect(() => {
    if (selectedStatus === "DONE") {
      setDisplayTime(task?.totalTimeSpent || 0);
    } else {
      setDisplayTime(elapsedTime);
    }
  }, [selectedStatus, elapsedTime, task?.totalTimeSpent]);

  const { isLightMode } = useCustomTheme();

  const { t, currentLanguage, getDir } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const handleBackdropClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // Always try to save changes before closing
    try {
      await updateTaskData(task!.id, {
        status: selectedStatus!,
        priority: selectedPriority!,
        description: descriptionRef.current!.value,
        due_date: calendar!,
      }).then(() => {
        queryClient
          .invalidateQueries({
            queryKey: ["tasks", "get-all"],
          })
          .then(() => {
            console.log("done invalidating queries");
          });
        console.log("done updating  ");
      });
    } catch (error) {
      console.log("Error updating task card data :  ", error);
    }

    // Close panel
    onClose(e);
  };

  const { setSnackbarConfig } = useMokkBar();

  const handleStart = async () => {
    if (selectedStatus !== "ONGOING") {
      setSnackbarConfig({
        message: t("Task Status must be ONGOING"),
        open: true,
        severity: "warning",
      });
      return;
    }

    await startTimer();
  };

  const handlePause = async () => {
    await pauseTimer();
  };

  // In the status option selection handler, add state updates
  const handleStatusChange = (option) => {
    if (["DONE", "CLOSED", "CANCELED"].includes(option)) {
      if (userId == task?.assignee._id || userId == task?.emp?.id) {
        setPendingStatusChange(option as "DONE" | "CLOSED" | "CANCELED");
        setIsStatusConfirmationModalOpen(true);
        setStatusMenuOpen(false);

        // Immediately update UI to reflect completed state
        if (isRunning) {
          // Stop the timer if it's running
          pauseTimer();
        }
      } else {
        setSnackbarConfig({
          open: true,
          message: t("You can't change the status to DONE"),
          type: "warning",
        });
      }
    } else {
      setSelectedStatus(option);
      setStatusMenuOpen(false);
    }
  };

  const handleStatusConfirmed = () => {
    if (pendingStatusChange) {
      setSelectedStatus(pendingStatusChange);
      setPendingStatusChange(null);
    }
  };
  const { data: allTasks } = useCustomQuery<ReceiveTaskType[]>({
    queryKey: ["tasks", "get-all"],
    url: `/tasks/get-all-tasks`,
    nestedData: true,
  });

  const {
    comments,
    comment,
    attachedFile,
    setComment,
    handleFileChange,
    handleSendComment,
    fileInputRef,
    isSubmitting,
    handleViewFile,
    isLoadingFile,
    setAttachedFile,
  } = useComments(task?.id, true);

  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm cursor-auto z-40"
        onClick={handleBackdropClick}
      />

      <div className="bg-secondary rounded-xl shadow-md w-[400px] sm:w-[500px] text-twhite gap-4 fixed top-[10px] right-[10px] bottom-[10px] z-50 p-6 cursor-default overflow-auto ">
        <div
          onClick={handleBackdropClick}
          className="text-twhite absolute top-4 right-4 text-xl cursor-pointer"
        >
          &times;
        </div>
        {/* Header with Save Button */}
        <div className="flex justify-between items-center mb-4">
          {/* Task Title */}
          <h1 className="text-lg font-semibold">{task?.name}</h1>

          {/* Save Button */}
          {(isAdmin || isPrimary || userId === task?.assignee._id || userId === task?.emp?.id) && (
            <button
              onClick={() => {
                // Save changes
                updateTaskData(task!.id, {
                  status: selectedStatus!,
                  priority: selectedPriority!,
                  description: descriptionRef.current!.value,
                  due_date: calendar!,
                }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["tasks", "get-all"] });
                  setSnackbarConfig({
                    message: t("Changes saved successfully"),
                    open: true,
                    severity: "success",
                  });
                }).catch(error => {
                  console.error("Error saving changes:", error);
                  setSnackbarConfig({
                    message: t("Failed to save changes"),
                    open: true,
                    severity: "error",
                  });
                });
              }}
              className="px-4 py-2 rounded-md flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t("Save Changes")}
            </button>
          )}
        </div>
        {/* Assignee and Due Date */}
        <div className="flex gap-4 items-center">
          <div className="text-twhite text-sm">{t("Assignee")}</div>
          <div className="flex items-center gap-2" dir="ltr">
            <span
              className={`bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center ${isLightMode ? "text-tblackAF" : "text-twhite"
                }  font-semibold`}
            >
              {task?.assignee.name.charAt(0).toUpperCase()}
            </span>
            <p>{task?.assignee.name}</p>
          </div>
        </div>
        {/* Due Date */}
        <div className="flex gap-4 items-center">
          <div className="text-twhite text-sm">{t("Due Date")}</div>
          <div
            className={`flex items-center gap-2 cursor-pointer border border-blue-500 rounded px-2 py-1`}
            onClick={() => calRef.current?.showPicker()}
            dir="ltr"
          >
            <div
              className={`border ${task?.is_over_due ? "border-red-500" : "border-green-500"
                } rounded-full p-2`}
            >
              <Image
                src={task?.is_over_due ? CalendarRedIcon : CalendarIcon}
                alt="calendar icon"
                height={15}
                width={15}
              />
            </div>
            <input
              type="date"
              ref={calRef}
              onChange={(e) => setCalendar(e.target.value)}
              className="pointer-events-none absolute opacity-0 bg-main"
            />
            <p
              className={`flex gap-4 ${task?.is_over_due ? "text-red-500" : "text-green-600"
                } ${isDueSoon(calendar!) ? "flash" : ""}`}
            >
              {formatDate(calendar!, currentLanguage as "ar" | "en")}
            </p>
          </div>
        </div>
        {/* Parent task */}
        <div
          className={`relative flex items-center  justify-between gap-5 w-full  ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
            }  rounded px-3 py-2`}
        >
          <span>{t("Parent Task")}</span>
          <span
            className={`  px-2 py-1 rounded text-xs cursor-pointer ${isLightMode
              ? "bg-darkest text-tblackAF"
              : "bg-yellow-500 text-dark"
              } `}
          >
            {task?.parent_task
              ? allTasks &&
              allTasks.find(
                (singleTask) => singleTask.id == task?.parent_task
              )?.name
              : t("No Parent Task")}
          </span>
        </div>
        {/* Assigned Emp  */}
        {task && task.emp && (
          <div
            className={`relative flex items-center   gap-5 w-fit ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
              } rounded px-3 py-2`}
          >
            <span className="text-nowrap">{t("Assigned Emp")}</span>
            <div
              className={`  ${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
                } text-twhite py-2 px-3 w-fit mx-auto rounded-md  text-sm font-semibold text-center`}
            >
              {task.emp.name + " - " + task.emp.job.title}
            </div>
          </div>
        )}
        {/* Priority Dropdown */}
        <div
          ref={priorityRef}
          className={`relative flex items-center justify-between w-full ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
            } rounded px-3 py-2`}
        >
          <span>{t("Priority")}</span>
          <span
            className={`${getPriorityColor(selectedPriority!)} ${isLightMode ? "text-twhite" : "text-tblackAF"
              } px-2 py-1 rounded text-xs cursor-pointer border border-blue-500`}
            onClick={() => setPriorityMenuOpen(!isPriorityMenuOpen)}
          >
            {t(selectedPriority)}
          </span>
          {isPriorityMenuOpen && (
            <div
              className={`absolute top-1/2 mt-1 ${getDir() == "rtl" ? "left-10" : "right-10 "
                } bg-dark text-twhite rounded-md shadow-lg p-2 z-10 backdrop-blur-sm min-w-[120px]`}
            >
              {priorityOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedPriority(option);
                    setPriorityMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md ${isLightMode
                    ? "hover:bg-darkest hover:text-tblackAF"
                    : "hover:bg-gray-500"
                    } cursor-pointer text-center`}
                >
                  {t(option)}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Status Dropdown */}
        <div
          ref={statusRef}
          className={`relative flex items-center justify-between w-full ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
            } rounded px-3 py-2`}
        >
          <span>{t("Status")}</span>
          <span
            className={`bg-dark text-twhite px-2 py-1 rounded text-xs ${isStatusMenuOpen ? "cursor-pointer border border-blue-500" : "cursor-default"}`}
            onClick={() => {
              if (isStatusMenuOpen && (userId == task?.assignee._id || userId == task?.emp?.id)) {
                setStatusMenuOpen(!isStatusMenuOpen);
              }
            }}
          >
            {t(selectedStatus)}
          </span>
          {isStatusMenuOpen && (
            <div
              className={`absolute top-1/2 mt-1 ${getDir() == "rtl" ? "left-10" : "right-10 "
                }  bg-dark  text-twhite w-40 rounded-md shadow-lg p-2 z-10 backdrop-blur-sm`}
            >
              {statusOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleStatusChange(option)}
                  className="px-4 py-2 rounded-md hover:bg-gray-500 cursor-pointer"
                >
                  {t(option)}
                </div>
              ))}
            </div>
          )}
        </div>
        <StarRating
          max={5}
          defaultValue={3}
          size={32}
          isRatingOpen={isRatingOpen}
          setIsRatingOpen={setIsRatingOpen}
          onSubmit={(rating) =>
            updateTaskData(task?.id, {
              rate: rating,
            }).then(() => {
              console.log("Rating updated");
              setSnackbarConfig({
                open: true,
                message: t("Rating updated"),
                type: "success",
              });
            })
          }
          title={t("Rate this Task")}
        />
        {/* time tracking */}
        <div
          ref={statusRef}
          className={`relative flex items-center justify-between gap-2 w-full ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
            } rounded px-3 py-2`}
        >
          <span>{t("Session Time")}</span>
          <span className="bg-dark text-twhite px-2 py-1 rounded text-xs cursor-pointer">
            {formatTime(displayTime)}
          </span>
        </div>
        {userId == task?.emp.id && (
          <div
            ref={statusRef}
            className={`relative flex items-center justify-between gap-2 w-full ${isLightMode ? "bg-darker text-tblackAF" : "bg-tblack"
              } rounded px-3 py-2`}
          >
            <span>{t("Time Actions")}</span>

            {selectedStatus === "DONE" ? (
              <span className="bg-dark text-twhite px-2 py-1 rounded text-xs cursor-not-allowed flex items-center gap-1">
                <Image
                  src={CheckIcon}
                  alt="start icon"
                  width={15}
                  height={15}
                />{""}
                {t("Completed")}
              </span>
            ) : (
              <span className="bg-dark text-twhite px-2 py-1 rounded text-xs cursor-pointer flex items-center gap-2">
                {isLoading ? (
                  <PageSpinner />
                ) : !isRunning ? (
                  <div
                    className="bg-dark flex items-center gap-2"
                    onClick={handleStart}
                  >
                    <Image
                      src={PlayIcon}
                      alt="start icon"
                      width={15}
                      height={15}
                    />{""}
                    {t("Start")}
                  </div>
                ) : (
                  <div
                    className="bg-dark flex items-center gap-2"
                    onClick={handlePause}
                  >
                    <Image
                      src={PauseIcon}
                      alt="pause icon"
                      width={15}
                      height={15}
                    />{""}
                    {t("Pause")}
                  </div>
                )}
              </span>
            )}
          </div>
        )}
        {/* Time Log Section */}
        <div className="mt-4 mb-2">
          <TimeLogSection
            timeLogs={task?.timeLogs || []}
            totalTime={task?.totalTimeSpent || 0}
            currentLanguage={currentLanguage as string}
            isLightMode={isLightMode}
          />
        </div>
        {/* Description */}
        <div>
          <p className="text-tbright text-sm">{t("Description")}</p>
          <textarea
            ref={descriptionRef}
            defaultValue={task?.description}
            className={`text-twhite mt-2 p-4 rounded-md w-full outline-none bg-main ${isPriorityMenuOpen ? 'cursor-text border border-blue-500 focus:border-blue-600' : 'cursor-default border-none'
              }`}
            placeholder={t("What is this task about?")}
          ></textarea>
        </div>

        {/* Task Files Section */}
        <div className="mb-4">
          <label className="font-bold my-2 block">{t("Task Files")}</label>

          <div
            className={`${isLightMode ? "bg-droppable-fade" : "bg-droppable-fade"
              } shadow-md p-4 rounded-lg text-tmid gap-2`}
          >
            {task?.files && task.files.length > 0 ? (
              <div className="gap-3">
                {task.files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-md ${isLightMode ? "bg-darkest" : "bg-tblack"
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <svg
                        className="h-5 w-5 text-tmid"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#ffffff"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-white text-sm truncate max-w-xs">
                        {file.split("/").pop() || file}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        // Using the same handleViewFile function from comments
                        handleViewFile(file);
                      }}
                      disabled={isLoadingFile === file}
                      className="bg-dark text-twhite px-3 py-1 rounded-md hover:bg-secondary flex items-center gap-1 transition-colors border border-secondary"
                    >
                      {isLoadingFile === file ? (
                        <svg
                          className="animate-spin h-4 w-4 mx-1"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 mx-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                      )}
                      <span>{t("View")}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">
                {t("No files attached to this task.")}
              </p>
            )}
          </div>
        </div>

        {/* Subtask Button */}
        <label className="font-bold my-2 block">{t("SubTasks")}</label>

        <div
          className={` ${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
            }  shadow-md p-4 rounded-lg text-tmid gap-2  `}
        >
          {task && task.subTasks && task.subTasks.length > 0 ? (
            task.subTasks.map((sub, index) => (
              <div className="flex items-center gap-2" key={index}>
                <Image
                  src={SubtasksIcon}
                  alt="subtasks icon"
                  width={15}
                  height={15}
                  className={`text-twhite ${isLightMode ? `bg-tmid p-1 rounded-md w-5 h-5` : ""
                    }`}
                />
                <p className="text-tbright">{sub.name}</p>
              </div>
            ))
          ) : (
            <p>{t("No Subtasks yet.")}</p>
          )}
        </div>

        {(isAdmin || isPrimary) && isPriorityMenuOpen && (
          <button
            className={`${isLightMode ? "bg-darkest text-white" : "bg-gray-700"
              }  text-twhite py-2 px-4 rounded-lg flex items-center gap-2`}
            onClick={() => setIsModalOpen(true)}
          >
            <span>{t("Add subtask")}</span>
          </button>
        )}
        {/* Comments Section */}
        <div className="mb-4">
          <label className="font-bold my-2 block">{t("Comments")}</label>

          <div className="my-4 p-2 bg-main rounded-md shadow-sm">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-2 p-2 border-none outline-none focus:outline-none bg-main"
              placeholder={t("Add a comment...")}
              rows={2}
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="bg-secondary rounded-md p-1 hover:bg-dark">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="attach-file"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="attach-file"
                  className={`cursor-pointer flex gap-1 ${isSubmitting ? "opacity-50" : ""
                    }`}
                >
                  <Image
                    src={PaperClipIcon}
                    alt="paperclip icon"
                    width={16}
                    height={16}
                  />
                  {t("Attach File")}
                </label>
              </div>

              {/* Display attached file with remove button */}
              {attachedFile && (
                <div className="flex items-center bg-dark rounded-md px-2 py-1 max-w-[180px]">
                  <span className="text-sm text-tmid truncate mx-2">
                    {attachedFile.name}
                  </span>
                  <button
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isSubmitting}
                    className={`text-red-400 hover:text-red-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    title={t("Remove file")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}

              <button
                onClick={handleSendComment}
                disabled={!comment.trim() || isSubmitting}
                className={`bg-dark text-twhite px-3 py-1 rounded-md hover:bg-secondary gap-1 flex items-center ${!comment.trim() || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mx-1"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("Sending...")}
                  </>
                ) : (
                  <>
                    <Image
                      src={PaperPlaneIcon}
                      alt="paper plane icon"
                      width={16}
                      height={16}
                    />
                    {t("Send")}
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            className={`${isLightMode ? "bg-droppable-fade" : "bg-droppable-fade"
              } shadow-md p-4 rounded-lg text-tmid gap-2`}
          >
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="flex gap-2 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-tbright font-bold rounded-full flex items-center justify-center mx-4 text-dark">
                    {comment.author.name.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-twhite font-semibold">
                        {comment.author.name}
                      </p>
                      <p className="text-xs text-tdark">
                        {formatDate(
                          comment.createdAt,
                          currentLanguage as "ar" | "en"
                        )}
                      </p>
                    </div>
                    {comment.content && (
                      <div
                        className="bg-secondary text-twhite rounded-md p-3 mt-2 text-sm"
                        dir={getDir()}
                      >
                        {comment.content}
                      </div>
                    )}
                    {comment.files && comment.files.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {comment.files.map((file, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleViewFile(file)}
                            disabled={isLoadingFile === file}
                            className={`flex items-center rounded-md bg-dark text-twhite p-1.5 px-3 hover:bg-secondary transition-colors border border-secondary`}
                          >
                            {isLoadingFile === file ? (
                              <svg
                                className="animate-spin h-4 w-4 mx-2"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4 mx-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                              </svg>
                            )}
                            <span className="truncate max-w-xs">
                              {file.split("/").pop() || file}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4">{t("No comments yet.")}</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <AddSubTaskModal
            parentTask={task}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </>
      )}
      {/* Status Confirmation Modal */}
      {pendingStatusChange && (
        <TaskStatusConfirmationModal
          isOpen={isStatusConfirmationModalOpen}
          onClose={() => {
            setIsStatusConfirmationModalOpen(false);
            setPendingStatusChange(null);
          }}
          task={task!}
          newStatus={pendingStatusChange}
          onStatusConfirmed={handleStatusConfirmed}
        />
      )}
    </>
  );
};

export default ListTaskDetails;
