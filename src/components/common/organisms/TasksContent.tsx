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
import AddSectionModal from "../atoms/modals/AddSectionModal";
import { Plus } from "lucide-react";
import useCustomTheme from "@/hooks/useCustomTheme";

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
  const { isLightMode } = useCustomTheme();
  const [tasks, setTasks] = useState<{
    [key: string]: ReceiveTaskType[];
  }>({});

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (tasksData && sections) {
      // Group tasks by section name instead of section id
      const grouped: { [key: string]: ReceiveTaskType[] } = {};
      sections.forEach(section => {
        grouped[section._id] = tasksData.filter(task => task.section && task.section.name === section.name);
      });
      setTasks(grouped);
    }
  }, [tasksData, sections]);

  if (!tasksData || tasksData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 text-twhite min-h-[400px]">
        <div className="text-center mb-8">
          <p className="text-lg font-medium mb-2">{t("No Tasks")}</p>
          <p className="text-sm text-gray-400">{t("Create tasks to see them here")}</p>
        </div>

        {/* Add Section Button for empty state */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-dashed transition-all duration-300 ${isLightMode
            ? "border-darkest text-darkest hover:bg-darkest hover:text-tblackAF hover:border-solid"
            : "border-gray-600 text-gray-400 hover:bg-secondary hover:text-twhite hover:border-gray-500 hover:border-solid"
            }`}
        >
          <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-medium">{t("Add Section")}</span>
        </button>

        {/* Modal for empty state */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <AddSectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}
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
        <div className="grid grid-cols-3 md:grid-cols-12 gap-4">
          {sections &&
            sections.map((sec, index) => {
              return (
                <TaskColumn
                  key={index}
                  columnId={sec._id}
                  title={sec.name}
                  taskCount={(tasks && tasks[sec._id]?.length) || 0}
                  tasks={(tasks && tasks[sec._id]) || []}
                  section={sec}
                />
              );
            })}

          {/* Add Section Column */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-main rounded-lg p-4 h-full min-h-[200px] flex flex-col items-center ">
              <button
                onClick={() => setIsModalOpen(true)}
                className={`group flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed transition-all duration-300 w-full ${isLightMode
                  ? "border-darkest text-darkest hover:bg-darkest hover:text-tblackAF hover:border-solid"
                  : "border-gray-600 text-gray-400 hover:bg-secondary hover:text-twhite hover:border-gray-500 hover:border-solid"
                  }`}
              >
                <Plus className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" />
                <span className="font-medium text-center">{t("Add New Section")}</span>
              </button>
            </div>
          </div>
        </div>

        {isUpdating && <PageSpinner />}

        {/* Modal */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <AddSectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}
      </DragDropContext>
    </>
  );
};

export default TasksContent;