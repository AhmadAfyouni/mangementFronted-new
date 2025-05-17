import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import {
  formatDate,
  getPriorityBorderColor,
  isDueSoon,
} from "@/services/task.service";
import { TaskCardProps } from "@/types/components/TaskCard.type";
import { useRouter } from "next/navigation";
import React from "react";
import { Draggable } from "react-beautiful-dnd";

const TaskCard: React.FC<TaskCardProps> = ({ taskId, index, title, task }) => {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const handleTaskClick = (e: React.MouseEvent) => {
    // Prevent drag event from interfering with click
    if (e.defaultPrevented) return;
    router.push(`/tasks/${taskId}`);
  };

  return (
    <Draggable draggableId={taskId} index={index}>
      {(provided) => (
        <div
          className={`${isLightMode ? "bg-main " : "bg-dark"}   ${
            currentLanguage == "en" ? "border-l-2" : "border-r-2"
          } ${getPriorityBorderColor(
            task.priority
          )} rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleTaskClick}
        >
          <h3 className="text-lg font-bold text-tmid mb-4">{title}</h3>
          <div className="flex justify-between items-center">
            <div
              className={`flex gap-4 ${
                task.is_over_due ? "text-red-500" : "text-tdark"
              } ${isDueSoon(task.due_date) ? "flash" : ""}`}
            >
              {formatDate(task.due_date, currentLanguage as "en" | "ar")}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
