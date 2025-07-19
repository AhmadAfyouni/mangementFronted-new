import React, { useState, useEffect } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskCard from "../molcules/TaskCard";
import { TaskColumnProps } from "@/types/components/TaskColumn.type";
import useLanguage from "@/hooks/useLanguage";
import useCustomTheme from "@/hooks/useCustomTheme";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import PageSpinner from "../atoms/ui/PageSpinner";

const TaskColumn: React.FC<TaskColumnProps> = ({
  columnId,
  title,
  taskCount,
  tasks,
  section,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => setIsMenuOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  const { mutate: deleteSection, isPending } = useCreateMutation({
    onSuccessMessage: t("Section Deleted successfully!"),
    invalidateQueryKeys: ["sections"],
    requestType: "delete",
    endpoint: section ? `/sections/${section._id}` : "/sections/invalid",
  });


  console.log(section?.name == "Recently Assigned");


  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          className={` ${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
            }  rounded-xl  p-4 flex flex-col gap-4 col-span-3`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="flex items-center justify-between mb-2">
            <h2
              className={`text-lg font-bold  ${isLightMode ? "text-darkest" : "text-twhite"
                }`}
            >
              {t(title)}
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`  ${isLightMode ? "text-darkest" : "text-twhite"
                  } bg-main  px-2 rounded-xl w-10 text-center shadow-md py-0.5 text-sm font-bold`}
              >
                {taskCount}
              </div>
              {/* Section Actions Menu */}
              {section && section?.name != "Recently Assigned" && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="p-2 rounded-lg hover:bg-main transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {isMenuOpen && (
                    <div className={`absolute top-10 right-0 w-40 ${isLightMode ? 'bg-darker' : 'bg-secondary'} rounded-xl  shadow-xl  z-10`}>
                      <button
                        className={` rounded-t-lg  w-full px-4 py-3 text-sm flex items-center gap-3 transition-colors ${isLightMode ? 'text-tblackAF hover:bg-darkest' : 'text-twhite hover:bg-main'}`}
                        onClick={() => {
                          setIsRenameOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Pencil className="w-4 h-4 text-blue-400" />
                        {t("Rename")}
                      </button>
                      <button
                        className={`rounded-b-lg  w-full px-4 py-3 text-sm flex items-center gap-3 transition-colors ${isLightMode ? 'text-tblackAF hover:bg-darkest' : 'text-twhite hover:bg-main'}`}
                        onClick={() => {
                          deleteSection({});
                          setIsMenuOpen(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        {t("Delete")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isPending && <PageSpinner title={t("Deleting ...")} />}

          <div className="flex flex-col gap-3">
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
              onClick={() => { }}
              className={`rounded-xl shadow-md p-4 h-20 w-full border-dashed !text-lg ${isLightMode
                ? "border-tblack text-tdark "
                : "border-tblack text-tblack"
                }  border-2 text-center content-center  font-bold  cursor-pointer`}
            >
              {t("Drop Here")}
            </div>

            {provided.placeholder}
          </div>

          {/* Rename Modal */}
          {isRenameOpen && (
            <>
              <div
                className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
                onClick={() => setIsRenameOpen(false)}
              />
              <AddSectionModal
                sectionData={section}
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default TaskColumn;
