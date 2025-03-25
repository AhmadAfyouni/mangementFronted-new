import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { categorizeTasks } from "@/services/task.service";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { useEffect, useState } from "react";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import ListSection from "../molcules/ListSection";

const ListTasks = ({
  tasksData,
  sections,
}: {
  tasksData: ReceiveTaskType[] | undefined;
  sections: SectionType[] | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<{
    [key: string]: ReceiveTaskType[];
  }>({});
  const { isLightMode } = useCustomTheme();
  const { t, currentLanguage } = useLanguage();
  useEffect(() => {
    if (tasksData) {
      const categorizedTasks = categorizeTasks(tasksData);
      setTasks(categorizedTasks);
    }
  }, [tasksData]);

  return (
    <>
      <div className="bg-main  rounded-lg p-4 w-full h-full">
        <div className="min-w-full bg-main rounded-md">
          <div className="flex items-center justify-between flex-wrap">
            <div
              className={`w-[25%] h-[50px] text-center px-6 py-3 border-y border-slate-500 ${
                currentLanguage == "en" ? "text-left" : "text-right"
              } text-md font-bold text-tmid  truncate`}
            >
              {t("Task Name")}
            </div>
            <div
              className={`w-[25%] h-[50px] text-center px-6 py-3 border border-slate-500 ${
                currentLanguage == "en" ? "text-left" : "text-right"
              } text-md font-bold text-tmid truncate `}
            >
              {t("Due Date")}
            </div>
            <div
              className={`w-[25%] h-[50px] text-center px-6 py-3 border border-slate-500 ${
                currentLanguage == "en" ? "text-left" : "text-right"
              } text-md font-bold text-tmid  `}
            >
              {t("Status")}
            </div>
            <div
              className={`w-[25%] h-[50px] text-center px-6 py-3 border-y border-slate-500 ${
                currentLanguage == "en" ? "text-left" : "text-right"
              } text-md font-bold text-tmid  `}
            >
              {t("Actions")}
            </div>
          </div>
          <div>
            {sections &&
              sections.map((section) => (
                <ListSection
                  key={section._id}
                  section={section}
                  tasks={tasks && tasks[section._id]}
                />
              ))}
          </div>
        </div>
        <div
          onClick={() => setIsModalOpen(true)}
          className={`rounded-xl shadow-md py-2 px-4    mt-3  border-dashed  hover:shadow-xl border-2 text-center content-center  w-fit ${
            isLightMode
              ? "text-darkest hover:bg-darkest border-darkest  hover:text-tblackAF"
              : "border-slate-500 hover:bg-slate-500 text-tblack hover:text-twhite"
          }  cursor-pointer`}
        >
          {t("Add section")}
        </div>
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0  backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <AddSectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ListTasks;
