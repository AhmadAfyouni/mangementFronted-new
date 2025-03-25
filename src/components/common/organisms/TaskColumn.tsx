import React from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskCard from "../molcules/TaskCard";
import { TaskColumnProps } from "@/types/components/TaskColumn.type";
import useLanguage from "@/hooks/useLanguage";
import useCustomTheme from "@/hooks/useCustomTheme";

const TaskColumn: React.FC<TaskColumnProps> = ({
  columnId,
  title,
  taskCount,
  tasks,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          className={` ${
            isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
          }  rounded-xl  p-4 flex flex-col space-y-4 col-span-3`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="flex items-center justify-between mb-2">
            <h2
              className={`text-lg font-bold  ${
                isLightMode ? "text-darkest" : "text-twhite"
              }`}
            >
              {t(title)}
            </h2>
            <div
              className={`  ${
                isLightMode ? "text-darkest" : "text-twhite"
              } bg-main  px-2 rounded-xl w-10 text-center shadow-md py-0.5 text-sm font-bold`}
            >
              {taskCount}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            {tasks.map((task, index) => (
              <TaskCard
                task={task}
                key={task.id}
                taskId={task.id}
                index={index}
                title={task.name}
                commentsCount={16}
                attachmentsCount={24}
                priority={task.priority + ""}
              />
            ))}

            <div
              onClick={() => {}}
              className={`rounded-xl shadow-md p-4 h-20 w-full border-dashed !text-lg ${
                isLightMode
                  ? "border-tblack text-tdark "
                  : "border-tblack text-tblack"
              }  border-2 text-center content-center  font-bold  cursor-pointer`}
            >
              {t("Drop Here")}
            </div>

            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TaskColumn;
