"use client";

import AddSubTaskModal from "@/components/common/atoms/modals/AddSubTaskModal";
import StarRating from "@/components/common/atoms/tasks/StarsRating";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import useComments from "@/hooks/useComments";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import useTaskTimer from "@/hooks/useTaskTimer";
import { updateTaskData } from "@/services/task.service";
import { RootState } from "@/state/store";
import { ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Import the refactored components
import { TaskComments } from "@/components/common/organisms/TaskDetails/TaskComments";
import { TaskDescription } from "@/components/common/organisms/TaskDetails/TaskDescription";
import { TaskFiles } from "@/components/common/organisms/TaskDetails/TaskFiles";
import { TaskHeader } from "@/components/common/organisms/TaskDetails/TaskHeader";
import { TaskInfoCard } from "@/components/common/organisms/TaskDetails/TaskInfoCard";
import { TaskSidebar } from "@/components/common/organisms/TaskDetails/TaskSidebar";
import { TaskTimeTracking } from "@/components/common/organisms/TaskDetails/TaskTimeTracking";
import { AxiosError } from "axios";

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const { isLightMode } = useCustomTheme();

  // Fetch task data
  const {
    data: task,
    isLoading: isTaskLoading,
    error: taskError
  } = useCustomQuery<ReceiveTaskType>({
    queryKey: ["task", taskId],
    url: `/tasks/task/${taskId}`,
    nestedData: true
  });

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const { selector: userId } = useRedux(
    (state: RootState) => state.user.userInfo?.id
  );

  const [calendar, setCalendar] = useState<string | undefined>();
  const [isPriorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [description, setDescription] = useState<string>();
  const [taskName, setTaskName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Set initial values when task data is loaded
  useEffect(() => {
    if (task) {
      setCalendar(task.due_date);
      setSelectedPriority(task.priority);
      setSelectedStatus(task.status);
      setDescription(task.description);
      setTaskName(task.name);
    }
  }, [task]);

  const {
    startTimer,
    pauseTimer,
    elapsedTime,
    isRunning,
    isLoading,
  } = useTaskTimer(taskId, task?.timeLogs || []);

  // Track display time
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (task) {
      if (task.status === "DONE") {
        setDisplayTime(task.totalTimeSpent || 0);
      } else {
        setDisplayTime(elapsedTime);
      }
    }
  }, [task, elapsedTime]);

  const queryClient = useQueryClient();
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

  const handleUpdate = async () => {
    try {
      await updateTaskData(taskId, {
        name: taskName!,
        status: selectedStatus!,
        priority: selectedPriority!,
        description: description!,
        due_date: calendar!,
      });

      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      const err = error as AxiosError;
      console.log("Error updating task:", err);

      // Revert local state to original task data on save failure
      if (task) {
        setTaskName(task.name);
        setSelectedStatus(task.status);
        setSelectedPriority(task.priority);
        setDescription(task.description);
        setCalendar(task.due_date);
      }
      // Extract message safely
      let errorMessage = "An error occurred";
      if (err.response?.data && typeof err.response.data === "object" && "message" in err.response.data) {
        errorMessage = (err.response.data as { message: string }).message;
      }
      setSnackbarConfig({
        message: errorMessage,
        open: true,
        severity: "error",
      });
    }
  };

  const handleStatusChange = (option: string) => {
    if (option === "DONE") {
      if (userId === task?.assignee?._id || userId === task?.assignee?._id) {
        setSelectedStatus(option);
        setStatusMenuOpen(false);
        setIsRatingOpen(true);

        if (isRunning) {
          pauseTimer();
        }
      } else {
        setSnackbarConfig({
          open: true,
          message: t("You can't change the status to DONE"),
          severity: "warning",
        });
      }
    } else {
      setSelectedStatus(option);
      setStatusMenuOpen(false);
    }
  };

  const { data: allTasks } = useCustomQuery<ReceiveTaskType[]>({
    queryKey: ["tasks"],
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
    // Edit/Delete functionality
    editingComment,
    editText,
    setEditText,
    startEditComment,
    cancelEditComment,
    saveCommentEdit,
    deleteComment,
  } = useComments(taskId, true);

  // Enhanced file handling with error handling
  const handleViewFileWithErrorHandling = (fileUrl: string) => {
    try {
      handleViewFile(fileUrl);
    } catch (error) {
      console.error("Error viewing file:", error);
      setSnackbarConfig({
        message: t("Failed to view file. Please try again."),
        open: true,
        severity: "error",
      });
    }
  };

  if (isTaskLoading || !task) {
    return (
      <GridContainer>
        <div className="col-span-full flex items-center justify-center min-h-screen">
          <PageSpinner title={t("Loading task details...")} />
        </div>
      </GridContainer>
    );
  }

  // If there was an error loading the task
  if (taskError) {
    return (
      <GridContainer>
        <div className="col-span-full flex flex-col items-center justify-center min-h-screen">
          <div className="bg-red-900/20 border border-red-900 text-red-300 p-4 rounded-lg text-center max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">{t("Error Loading Task")}</h2>
            <p className="mb-4">{t("There was a problem loading the task details.")}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              {t("Retry")}
            </button>
          </div>
        </div>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <div className={`col-span-full min-h-screen p-6 ${isRTL ? 'rtl' : 'ltr'} ${task.parent_task
        ? 'bg-gradient-to-br from-main via-main to-slate-900/10'
        : 'bg-main'
        }`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <TaskHeader
            task={task}
            onUpdate={handleUpdate}
            taskName={taskName}
            onNameChange={setTaskName}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <TaskInfoCard
                task={task}
                selectedStatus={selectedStatus}
                selectedPriority={selectedPriority}
                due_date={calendar}
                onStatusChange={handleStatusChange}
                onPriorityChange={setSelectedPriority}
                onDueDateChange={setCalendar}
                isStatusMenuOpen={isStatusMenuOpen}
                isPriorityMenuOpen={isPriorityMenuOpen}
                setStatusMenuOpen={setStatusMenuOpen}
                setPriorityMenuOpen={setPriorityMenuOpen}
                allTasks={allTasks}
              />

              <TaskDescription
                description={description || ''}
                onChange={setDescription}
              />

              <TaskFiles
                files={task.files}
                onViewFile={handleViewFileWithErrorHandling}
                isLoadingFile={isLoadingFile}
                taskId={taskId}
              />

              <TaskComments
                comments={comments}
                comment={comment}
                setComment={setComment}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                handleSendComment={handleSendComment}
                handleViewFile={handleViewFileWithErrorHandling}
                isSubmitting={isSubmitting}
                isLoadingFile={isLoadingFile}
                // Edit/Delete props
                editingComment={editingComment}
                editText={editText}
                setEditText={setEditText}
                startEditComment={startEditComment}
                cancelEditComment={cancelEditComment}
                saveCommentEdit={saveCommentEdit}
                deleteComment={deleteComment}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TaskTimeTracking
                displayTime={displayTime}
                isTaskRunning={isRunning}
                isMakingAPICall={isLoading}
                selectedStatus={selectedStatus}
                onStart={handleStart}
                onPause={handlePause}
                timeLogs={task.timeLogs}
                totalTimeSpent={task.totalTimeSpent}
                isLightMode={isLightMode}
                isSubtask={!!task.parent_task}
              />

              <TaskSidebar
                task={task}
                allTasks={allTasks}
                onAddSubtask={() => setIsModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <AddSubTaskModal
              parentTask={task}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}

        {/* Rating Modal */}
        <StarRating
          max={5}
          defaultValue={3}
          size={32}
          isRatingOpen={isRatingOpen}
          setIsRatingOpen={setIsRatingOpen}
          onSubmit={async (rating) => {
            try {
              await updateTaskData(taskId, {
                rating: rating + "",
              });

              queryClient.invalidateQueries({ queryKey: ["task", taskId] });

              setSnackbarConfig({
                open: true,
                message: t("Rating updated"),
                severity: "success",
              });
            } catch (error) {
              console.error("Error updating rating:", error);
              setSnackbarConfig({
                open: true,
                message: t("Failed to update rating"),
                severity: "error",
              });
            }
          }}
          title={t("Rate this Task")}
        />
      </div>
    </GridContainer>
  );
}