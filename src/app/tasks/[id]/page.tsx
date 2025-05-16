"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import StarRating from "@/components/common/atoms/tasks/StarsRating";
import AddSubTaskModal from "@/components/common/atoms/modals/AddSubTaskModal";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useComments from "@/hooks/useComments";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import useTimeTicker from "@/hooks/useTimeTicker";
import { updateTaskData } from "@/services/task.service";
import { RootState } from "@/state/store";
import { ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";

// Import the refactored components
import { TaskHeader } from "@/components/common/organisms/TaskDetails/TaskHeader";
import { TaskInfoCard } from "@/components/common/organisms/TaskDetails/TaskInfoCard";
import { TaskDescription } from "@/components/common/organisms/TaskDetails/TaskDescription";
import { TaskFiles } from "@/components/common/organisms/TaskDetails/TaskFiles";
import { TaskComments } from "@/components/common/organisms/TaskDetails/TaskComments";
import { TaskTimeTracking } from "@/components/common/organisms/TaskDetails/TaskTimeTracking";
import { TaskSidebar } from "@/components/common/organisms/TaskDetails/TaskSidebar";
import { AxiosError } from "axios";

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const { isLightMode } = useCustomTheme();

  // Fetch task data
  const { data: task, isLoading: isTaskLoading } = useCustomQuery<ReceiveTaskType>({
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
    startTaskTicker,
    pauseTaskTicker,
    elapsedTime,
    isTaskRunning,
    isMakingAPICall,
  } = useTimeTicker(taskId, task?.timeLogs || []);

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
    await startTaskTicker();
  };

  const handlePause = async () => {
    await pauseTaskTicker();
  };

  const handleUpdate = async () => {
    try {
      const res = await updateTaskData(taskId, {
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

        if (isTaskRunning) {
          pauseTaskTicker();
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

  if (isTaskLoading || !task) {
    return (
      <GridContainer>
        <div className="col-span-full flex items-center justify-center min-h-screen">
          <PageSpinner title={t("Loading task details...")} />
        </div>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <div className={`col-span-full min-h-screen bg-main p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
              />

              <TaskDescription
                description={description || ''}
                onChange={setDescription}
              />

              <TaskFiles
                files={task.files}
                onViewFile={handleViewFile}
                isLoadingFile={isLoadingFile}
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
                handleViewFile={handleViewFile}
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
                isTaskRunning={isTaskRunning}
                isMakingAPICall={isMakingAPICall}
                selectedStatus={selectedStatus}
                onStart={handleStart}
                onPause={handlePause}
                timeLogs={task.timeLogs}
                totalTimeSpent={task.totalTimeSpent}
                isLightMode={isLightMode}
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
