import { ChevronDown, Pencil, MoreVertical, Trash2, Folder, FolderOpen } from "lucide-react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomTheme from "@/hooks/useCustomTheme";
import useHierarchy from "@/hooks/useHierarchy";
import useLanguage from "@/hooks/useLanguage";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import React, { useEffect, useState } from "react";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import PageSpinner from "../atoms/ui/PageSpinner";

const ListSection: React.FC<{
  section: SectionType;
  tasks: ReceiveTaskType[] | undefined;
}> = ({ section, tasks }) => {
  const [isOpen, setIsOpen] = useState(true); // Changed to true to open by default
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const { currentLanguage, t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { renderTaskWithSubtasks, organizeTasksByHierarchy } = useHierarchy();

  const isRTL = currentLanguage === "ar";

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
    endpoint: `/sections/${section._id}`,
  });

  const taskCount = tasks?.length || 0;

  return (
    <>
      {isPending && <PageSpinner title={t("Deleting ...")} />}

      {/* Section Header */}
      <div
        className={`col-span-4 bg-secondary/50 px-6 py-3 cursor-pointer hover:bg-secondary/70 transition-colors`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-0" : isRTL ? "rotate-90" : "-rotate-90"
              }`} />

            {isOpen ? (
              <FolderOpen className="w-5 h-5 text-blue-400" />
            ) : (
              <Folder className="w-5 h-5 text-gray-400" />
            )}

            <h3 className="text-lg font-semibold text-twhite">
              {section.name}
            </h3>

            <span className="text-sm text-gray-400">
              {taskCount} {t("tasks")}
            </span>
          </div>

          {/* Section Actions */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-dark/50 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>

            {isMenuOpen && (
              <div className={`absolute top-10 ${isRTL ? 'left-0' : 'right-0'} w-48 
                ${isLightMode ? 'bg-darker' : 'bg-tblack'} 
                rounded-lg shadow-xl border border-gray-700 z-10`}>
                <button
                  className={`w-full px-4 py-3 text-sm flex items-center gap-3 transition-colors
                    ${isLightMode
                      ? 'text-tblackAF hover:bg-darkest'
                      : 'text-twhite hover:bg-dark'
                    }`}
                  onClick={() => {
                    setIsRenameOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Pencil className="w-4 h-4 text-blue-400" />
                  {t("Rename")}
                </button>

                <button
                  className={`w-full px-4 py-3 text-sm flex items-center gap-3 transition-colors
                    ${isLightMode
                      ? 'text-tblackAF hover:bg-darkest'
                      : 'text-twhite hover:bg-dark'
                    }`}
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
        </div>
      </div>

      {/* Section Tasks */}
      {isOpen && tasks && tasks.length > 0 && (
        organizeTasksByHierarchy(tasks).map((task) =>
          renderTaskWithSubtasks(task, 0)
        )
      )}

      {isOpen && (!tasks || tasks.length === 0) && (
        <div className="col-span-4 px-6 py-8 text-center text-gray-400 bg-main/50">
          <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-sm">{t("No tasks in this section")}</p>
        </div>
      )}

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
    </>
  );
};

export default ListSection;
