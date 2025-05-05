import { ArrowDownIcon, PencilIcon, ThreeDotsIcon, TrashIcon } from "@/assets";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomTheme from "@/hooks/useCustomTheme";
import useHierarchy from "@/hooks/useHierarchy";
import useLanguage from "@/hooks/useLanguage";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddSectionModal from "../atoms/modals/AddSectionModal";
import PageSpinner from "../atoms/ui/PageSpinner";

const ListSection: React.FC<{
  section: SectionType;
  tasks: ReceiveTaskType[] | undefined;
}> = ({ section, tasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { renderTaskWithSubtasks, organizeTasksByHierarchy } = useHierarchy();
  useEffect(() => {
    if (isMenuOpen) {
      setInterval(() => setIsMenuOpen(false), 5000);
    }
  }, [isMenuOpen]);
  const { t } = useLanguage();

  const { mutate: deleteSection, isPending } = useCreateMutation({
    endpoint: `/sections/${section._id}`,
    onSuccessMessage: t("Section Deleted successfully!"),
    invalidateQueryKeys: ["sections"],
    requestType: "delete",
  });

  return (
    <>
      {isPending && <PageSpinner title={t("Deleting ...")} />}
      <tr>
        <td
          colSpan={4}
          className=" py-3 text-left text-sm font-semibold text-tdark cursor-pointer "
        >
          <div className="flex items-center gap-2 text-twhite font-bold text-lg group">
            <span
              className={`flex items-center gap-2 `}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <Image
                src={ArrowDownIcon}
                alt="arrow icon"
                width={20}
                height={20}
                className={`mx-2  transform 
                z-auto
                ${isLightMode ? `bg-tmid p-1 rounded-md h-[25px] w-[25px]` : ""}
                ${isOpen
                    ? "rotate-0"
                    : currentLanguage == "en"
                      ? "-rotate-90"
                      : "rotate-90"
                  }`}
              />
              {t(section.name)}
            </span>

            <div className="relative">
              <Image
                src={ThreeDotsIcon}
                alt="more icon"
                height={24}
                width={24}
                className="opacity-0 group-hover:opacity-100  group-hover:bg-dark p-1 rounded-md "
                onClick={() => setIsMenuOpen((prev) => !prev)}
              />
              {isMenuOpen && (
                <div
                  className={`absolute top-8 left-0 w-32
                  
                  ${isLightMode ? `bg-darker  ` : "bg-black/80"}
                   border border-slate-600 rounded-md shadow-lg z-10`}
                >
                  <ul>
                    <li
                      className={`px-4 py-2 text-sm ${isLightMode
                          ? `text-tblackAF hover:bg-darkest`
                          : "text-twhite hover:bg-slate-700"
                        }  cursor-pointer  flex items-center gap-1  `}
                      onClick={() => {
                        setIsRenameOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Image src={PencilIcon} alt="" width={14} height={14} />
                      {t("Rename")}
                    </li>
                    <li
                      className={`px-4 py-2 text-sm ${isLightMode
                          ? `text-tblackAF hover:bg-darkest`
                          : "text-twhite hover:bg-slate-700"
                        }  cursor-pointer  flex items-center gap-1`}
                      onClick={() => {
                        console.log("Delete clicked");
                        deleteSection({});
                        setIsMenuOpen(false);
                      }}
                    >
                      <Image src={TrashIcon} alt="" width={14} height={15} />
                      {t("Delete")}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
      {/* {isOpen &&
        tasks &&
        tasks.map((task) => (
          <>
            <ListRow key={task.id} task={task} />
            <div className="w-full h-2 bg-transparent"></div>
          </>
        ))} */}
      {isOpen &&
        tasks &&
        organizeTasksByHierarchy(tasks).map((task) =>
          renderTaskWithSubtasks(task, 0)
        )}

      {isRenameOpen && (
        <>
          <div
            className="fixed inset-0  backdrop-blur-sm"
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
