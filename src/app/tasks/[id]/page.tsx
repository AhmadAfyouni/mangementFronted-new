"use client";

import AddSubTaskModal from "@/components/common/atoms/modals/AddSubTaskModal";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import useComments from "@/hooks/useComments";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { updateTaskData } from "@/services/task.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/axios/usage";

// Import the refactored components
import { TaskComments } from "@/components/common/organisms/TaskDetails/TaskComments";
import { TaskDescription } from "@/components/common/organisms/TaskDetails/TaskDescription";
import { TaskFiles } from "@/components/common/organisms/TaskDetails/TaskFiles";
import { TaskHeader } from "@/components/common/organisms/TaskDetails/TaskHeader";
import { TaskInfoCard } from "@/components/common/organisms/TaskDetails/TaskInfoCard";
import { TaskSidebar } from "@/components/common/organisms/TaskDetails/TaskSidebar";
import { TaskTimeTracking } from "@/components/common/organisms/TaskDetails/TaskTimeTracking";
import { AxiosError } from "axios";
import TimeTrackingModal from "@/components/common/atoms/tasks/TimeTrackingModal";
import TaskStatusConfirmationModal from "@/components/common/atoms/modals/TaskStatusConfirmationModal";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";

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

  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isStatusConfirmationModalOpen, setIsStatusConfirmationModalOpen] = useState(false);
  const [isPriorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [calendar, setCalendar] = useState<string>("");
  const [expectedEndDate, setExpectedEndDate] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [selectedStatus, setSelectedStatus] = useState<string>("TODO");
  const [description, setDescription] = useState<string>("");
  const [taskName, setTaskName] = useState<string>("");
  const [pendingStatusChange, setPendingStatusChange] = useState<"DONE" | "CLOSED" | "CANCELED" | null>(null);
  const [isAfterRating, setIsAfterRating] = useState(false);
  const [ratingData, setRatingData] = useState<{ rating?: number; comment?: string } | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setCalendar(task.due_date || "");
      setSelectedPriority(task.priority || "LOW");
      setSelectedStatus(task.status || "TODO");
      setDescription(task.description || "");
      setTaskName(task.name || "");
      setExpectedEndDate(task.expected_end_date || "");
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
    queryClient.invalidateQueries({ queryKey: ["tasks", "get-all"] });
  };

  const handlePause = async () => {
    await pauseTimer();
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        name: taskName!,
        status: selectedStatus!,
        priority: selectedPriority!,
        description: description!,
        due_date: calendar!,
        expected_end_date: expectedEndDate || null,
      };

      await updateTaskData(taskId, updateData);

      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "get-all"] });

      setIsEditing(false);

      setSnackbarConfig({
        message: t("Changes saved successfully"),
        open: true,
        severity: "success",
      });
    } catch (error) {
      const err = error as AxiosError;
      console.log("Error updating task:", err);

      if (task) {
        setTaskName(task.name);
        setSelectedStatus(task.status);
        setSelectedPriority(task.priority);
        setDescription(task.description);
        setCalendar(task.due_date);
        setExpectedEndDate(task.expected_end_date || "");
      }

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
    const finalStatuses = ["DONE", "CLOSED", "CANCELED"];

    if (finalStatuses.includes(option)) {
      setSelectedStatus(option);
      setStatusMenuOpen(false);
      setPendingStatusChange(option as "DONE" | "CLOSED" | "CANCELED");

      // Pause timer if running
      if (isRunning) {
        pauseTimer();
      }

      if (task?.requiresRating) {
        // Show status confirmation modal for tasks that require rating
        setIsStatusConfirmationModalOpen(true);
      } else {
        // Show time tracking modal for tasks that don't require rating
        setIsAfterRating(false);
        setIsTimeTrackingOpen(true);
      }
    } else {
      // Regular status change for non-final statuses
      setSelectedStatus(option);
      setStatusMenuOpen(false);
    }
  };

  const { data: allTasks } = useCustomQuery<ReceiveTaskType[]>({
    queryKey: ["tasks", "get-all"],
    url: `/tasks/get-all-tasks`,
    nestedData: true,
  });

  const {
    comments: rawComments,
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
    editingComment,
    editText,
    setEditText,
    startEditComment,
    cancelEditComment,
    saveCommentEdit,
    deleteComment,
  } = useComments(taskId, true);

  // Process comments to organize them into nested structure
  const processComments = (comments: any[]) => {
    const mainComments: any[] = [];
    const replyComments: any[] = [];

    comments.forEach(comment => {
      // Check if this is a reply by looking for the special prefix
      const replyMatch = comment.content.match(/^\[REPLY_TO:([^:]+):([^\]]+)\]\s*(.*)/);

      if (replyMatch) {
        // This is a reply
        const [, parentId, parentAuthorName, actualContent] = replyMatch;
        replyComments.push({
          ...comment,
          content: actualContent,
          parentId,
          parentAuthorName,
          isReply: true
        });
      } else {
        // This is a main comment
        mainComments.push({
          ...comment,
          replies: [],
          isReply: false
        });
      }
    });

    // Attach replies to their parent comments
    replyComments.forEach(reply => {
      const parentComment = mainComments.find(c => c.id === reply.parentId);
      if (parentComment) {
        parentComment.replies.push(reply);
      }
    });

    return mainComments;
  };

  const comments = processComments(rawComments);

  // Reply functionality state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Handle sending reply
  const handleSendReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      // Find the parent comment to get its author name
      const parentComment = comments.find(c => c.id === parentId);
      const parentAuthorName = parentComment?.author.name || "Unknown";

      // Create reply content with special prefix to identify it as a reply
      const replyContent = `[REPLY_TO:${parentId}:${parentAuthorName}] ${replyText}`;

      // Send reply to backend
      await apiClient.post(`/comment`, {
        content: replyContent,
        taskId: taskId,
      });

      // Clear reply state
      setReplyingTo(null);
      setReplyText("");

      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });

      // Show success message
      setSnackbarConfig({
        message: t("Reply sent successfully"),
        open: true,
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      setSnackbarConfig({
        message: t("Failed to send reply"),
        open: true,
        severity: "error",
      });
    }
  };

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

  const handleTimeSubmit = async (actualTime: number) => {
    try {
      const statusToUpdate = pendingStatusChange || "DONE";
      const updateData: any = {
        status: statusToUpdate,
        actual_hours: actualTime,
      };
      if (ratingData) {
        if (ratingData.rating !== undefined) updateData.rate = ratingData.rating;
        if (ratingData.comment) updateData.comment = ratingData.comment;
      }
      await updateTaskData(taskId, updateData);
      setSelectedStatus(statusToUpdate);
      setPendingStatusChange(null);
      setIsTimeTrackingOpen(false);
      setIsAfterRating(false);
      setRatingData(undefined);
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "get-all"] });
      setSnackbarConfig({
        open: true,
        message: t("Task completed and time recorded"),
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating task time:", error);
      setSnackbarConfig({
        open: true,
        message: t("Failed to update task time"),
        severity: "error",
      });
      if (task) {
        setSelectedStatus(task.status);
      }
      setPendingStatusChange(null);
      setIsTimeTrackingOpen(false);
      setIsAfterRating(false);
      setRatingData(undefined);
    }
  };

  const handleStatusConfirmed = async (ratingData?: { rating?: number; comment?: string }) => {
    // For tasks that require rating, after rating, show the time tracking modal (step 2)
    setIsStatusConfirmationModalOpen(false);
    setIsAfterRating(true);
    setIsTimeTrackingOpen(true);
    setRatingData(ratingData); // Store for later
  };

  const showComments = useTasksGuard(["enableComments"]);
  const showSubTasks = useTasksGuard(["enableSubTasks"]);
  const showTimeTracking = useTasksGuard(["enableTimeTracking"]);

  if (isTaskLoading || !task) {
    return (
      <GridContainer>
        <div className="col-span-full flex items-center justify-center min-h-screen">
          <PageSpinner title={t("Loading task details...")} />
        </div>
      </GridContainer>
    );
  }

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
    <div className={`min-h-screen bg-main p-4 ${isRTL ? 'rtl' : 'ltr'} ${task.parent_task
      ? 'bg-gradient-to-br from-main via-main to-slate-900/10'
      : 'bg-main'
      }`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Compact Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <TaskHeader
          task={task}
          onUpdate={handleUpdate}
          taskName={taskName}
          onNameChange={setTaskName}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
        />
      </div>

      {/* Optimized Grid Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4">

          {/* Left Column - Main Content (8 columns) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            {/* Task Info Card - More Compact */}
            <div className="bg-secondary rounded-lg p-4 border border-gray-700">
              <TaskInfoCard
                task={task}
                selectedStatus={selectedStatus}
                selectedPriority={selectedPriority}
                due_date={calendar}
                expected_end_date={expectedEndDate}
                onStatusChange={handleStatusChange}
                onPriorityChange={setSelectedPriority}
                onDueDateChange={setCalendar}
                onExpectedEndDateChange={setExpectedEndDate}
                isStatusMenuOpen={isStatusMenuOpen}
                isPriorityMenuOpen={isPriorityMenuOpen}
                setStatusMenuOpen={setStatusMenuOpen}
                setPriorityMenuOpen={setPriorityMenuOpen}
                allTasks={allTasks}
                isEditing={isEditing}
              />
            </div>

            {/* Description and Files in Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="xl:col-span-1">
                <TaskDescription
                  description={description || ''}
                  onChange={setDescription}
                  isEditing={isEditing}
                />
              </div>
              <div className="xl:col-span-1">
                <TaskFiles
                  files={task.files}
                  onViewFile={handleViewFileWithErrorHandling}
                  isLoadingFile={isLoadingFile}
                  taskId={taskId}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* Time Tracking - Compact */}
            {showTimeTracking && (
              <div className="bg-secondary rounded-lg p-4 border border-gray-700">
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
              </div>
            )}

            {/* Sidebar Content */}
            {showSubTasks && (
              <TaskSidebar
                task={task}
                allTasks={allTasks}
                onAddSubtask={() => setIsModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Comments Section - Full Width Below All Cards */}
      {showComments && (
        <div className="max-w-7xl mx-auto mt-6">
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
            editingComment={editingComment}
            editText={editText}
            setEditText={setEditText}
            startEditComment={startEditComment}
            cancelEditComment={cancelEditComment}
            saveCommentEdit={saveCommentEdit}
            deleteComment={deleteComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            handleSendReply={handleSendReply}
          />
        </div>
      )}

      {/* Modals */}
      {isModalOpen && showSubTasks && (
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

      {/* Time Tracking Modal - for direct time entry OR after rating (Step 2) */}
      {/* Shows directly for non-rating tasks, or after rating submission */}
      {showTimeTracking && (
        <TimeTrackingModal
          isOpen={isTimeTrackingOpen}
          onClose={() => {
            setIsTimeTrackingOpen(false);
            setPendingStatusChange(null);
            setIsAfterRating(false);
            setRatingData(undefined);
            if (task && pendingStatusChange) {
              setSelectedStatus(task.status);
            }
          }}
          onSubmit={handleTimeSubmit}
          recordedTime={task?.totalTimeSpent || 0}
          taskStatus={pendingStatusChange || "DONE"}
          isAfterRating={isAfterRating}
        />
      )}

      {/* Status Confirmation Modal - for tasks that require rating (Step 1) */}
      {/* Shows first for rating, then triggers TimeTrackingModal */}
      {pendingStatusChange && (
        <TaskStatusConfirmationModal
          isOpen={isStatusConfirmationModalOpen}
          onClose={() => {
            setIsStatusConfirmationModalOpen(false);
            setPendingStatusChange(null);
            if (task && pendingStatusChange) {
              setSelectedStatus(task.status);
            }
          }}
          task={task}
          newStatus={pendingStatusChange}
          onStatusConfirmed={handleStatusConfirmed}
          requiresRating={task?.requiresRating || false}
          recordedTime={task?.totalTimeSpent || 0}
        />
      )}
    </div>
  );
}