// TasksContent.tsx
"use client";

import TaskColumn from "@/components/common/organisms/TaskColumn";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { categorizeTasks, onDragEnd } from "@/services/task.service";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import PageSpinner from "../atoms/ui/PageSpinner";

const TasksContent = ({
  tasksData,
  sections,
}: {
  sections: SectionType[] | undefined;
  tasksData: ReceiveTaskType[] | undefined;
}) => {
  const { setSnackbarConfig } = useMokkBar();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<{
    [key: string]: ReceiveTaskType[];
  }>({});

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (tasksData) {
      const categorizedTasks = categorizeTasks(tasksData);
      setTasks(categorizedTasks);
    }
  }, [tasksData]);

  if (!tasksData || tasksData.length === 0) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5 text-twhite">
        {t("No Tasks")}
      </div>
    );
  }
  return (
    <>
      <DragDropContext
        onDragEnd={async (result) => {
          try {
            setIsUpdating(true);
            await onDragEnd({
              result,
              tasks,
              setTasks,
              setMessage: (msg) => {
                setSnackbarConfig({
                  open: true,
                  message: msg,
                  severity: "error",
                });
              },
            });

            await queryClient.invalidateQueries({ queryKey: ["tasks"] });
          } catch (error) {
            console.error("Error during drag operation:", error);

            setSnackbarConfig({
              open: true,
              message: t("Failed to update tasks."),
              severity: "error",
            });
          } finally {
            setIsUpdating(false);
          }
        }}
      >
        <div className="grid  grid-cols-3 md:grid-cols-12 gap-4  ">
          {sections &&
            sections.map((sec, index) => {
              return (
                <TaskColumn
                  key={index}
                  columnId={sec._id}
                  title={sec.name}
                  taskCount={(tasks && tasks[sec._id]?.length) || 0}
                  tasks={(tasks && tasks[sec._id]) || []}
                />
              );
            })}
        </div>

        {isUpdating && <PageSpinner />}
      </DragDropContext>
    </>
  );
};

export default TasksContent;
