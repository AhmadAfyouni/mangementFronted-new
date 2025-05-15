import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { categorizeTasks } from "@/services/task.service";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { useEffect, useState } from "react";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import ListSection from "../molcules/ListSection";
import { Plus, ListChecks, Calendar, CircleCheckBig, Settings } from "lucide-react";

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

  const isRTL = currentLanguage === "ar";

  return (
    <>
      <div className="bg-main rounded-lg p-4 w-full h-full">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ListChecks className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-twhite">{t("Tasks Overview")}</h2>
          </div>
          <p className="text-gray-400">{t("Manage and track your tasks efficiently")}</p>
        </div>

        {/* Enhanced Table Container */}
        <div className="min-w-full bg-main rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-secondary/50 border-b border-gray-700">
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <ListChecks className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-twhite">{t("Task Name")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-twhite">{t("Due Date")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <CircleCheckBig className="w-5 h-5 text-green-400" />
              <span className="font-bold text-twhite">{t("Status")}</span>
            </div>
            <div
              className={`px-6 py-4 flex items-center gap-2 ${isRTL ? "text-right justify-end" : "text-left"
                }`}
            >
              <Settings className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-twhite">{t("Actions")}</span>
            </div>
          </div>

          {/* Table Body with Sections */}
          <div>
            {sections && sections.length > 0 ? (
              sections.map((section) => (
                <ListSection
                  key={section._id}
                  section={section}
                  tasks={tasks && tasks[section._id]}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ListChecks className="w-16 h-16 mb-4 text-gray-600" />
                <p className="text-lg font-medium mb-2">{t("No sections available")}</p>
                <p className="text-sm">{t("Create a section to organize your tasks")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Add Section Button */}
        <div className="mt-6 flex justify-start">
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
        </div>

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
      </div>
    </>
  );
};

export default ListTasks;
