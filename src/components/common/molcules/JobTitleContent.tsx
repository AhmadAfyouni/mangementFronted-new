import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { JobTitleType } from "@/types/JobTitle.type";
import Image from "next/image";
import { useState } from "react";
import CustomModal from "../atoms/modals/CustomModal";
import PageSpinner from "../atoms/ui/PageSpinner";
import { Eye } from "lucide-react";

const TruncatedText = ({ text }: { text: string }) => (
  <p className="truncate max-w-[200px]">{text || "N/A"}</p>
);

interface ShowMoreListProps {
  items: string[];
  onShowMore: () => void;
  isLightMode: boolean;
}

const ShowMoreList = ({
  items,
  onShowMore,
  isLightMode,
}: ShowMoreListProps) => {
  const firstItem = items[0] || "N/A";
  const remainingCount = items.length - 1;

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <p className="truncate max-w-[150px]">{firstItem}</p>
      {items.length > 1 && (
        <button
          onClick={onShowMore}
          className={`
            flex items-center gap-1 p-1.5 rounded-lg
            transition-all duration-200
            ${
              isLightMode
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }
          `}
          title="Show More"
        >
          <Eye size={16} />
          <span className="text-xs">+{remainingCount}</span>
        </button>
      )}
    </div>
  );
};

const JobTitleContent = ({ selectedOption }: { selectedOption: string }) => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["job_title_update"]);
  const { isLightMode } = useCustomTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string[];
  } | null>(null);

  const { data: jobs, isLoading } = useCustomQuery<JobTitleType[]>({
    queryKey: ["jobTitles", selectedOption],
    url:
      selectedOption === "view"
        ? `/job-titles/view`
        : `/job-titles/get-job-titles`,
  });

  const handleShowMore = (
    type: "responsibilities" | "permissions",
    title: string,
    items: string[]
  ) => {
    setModalContent({
      title,
      content: items,
    });
    setIsModalOpen(true);
  };

  const { NavigateButton } = useSetPageData<JobTitleType>("/jobs/add-title");

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col space-y-4 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        {!jobs || jobs.length === 0 ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5">
              {t("No Job Titles Found")}
            </div>
          </>
        ) : (
          <>
            <table className="min-w-full bg-main text-twhite rounded-lg shadow-md">
              <thead
                className={
                  isLightMode
                    ? "bg-darkest text-tblackAF"
                    : "bg-tblack text-twhite"
                }
              >
                <tr>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Title")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Description")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Responsibilities")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Permissions")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Department")}
                  </th>
                  {(isAdmin || hasEditPermission) && (
                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                      {t("Actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {jobs.map((jobTitle) => (
                  <tr
                    key={jobTitle.id}
                    className={`
                  ${
                    isLightMode
                      ? "hover:bg-darker text-blackAF hover:text-tblackAF"
                      : "hover:bg-slate-700 text-twhite"
                  }
                  group transition-colors
                `}
                  >
                    <td className="py-3 px-4 text-center">
                      <TruncatedText text={jobTitle.title} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <TruncatedText text={jobTitle.description} />
                    </td>
                    <td className="py-3 px-4">
                      <ShowMoreList
                        items={jobTitle.responsibilities}
                        onShowMore={() =>
                          handleShowMore(
                            "responsibilities",
                            t("Responsibilities"),
                            jobTitle.responsibilities
                          )
                        }
                        isLightMode={isLightMode}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <ShowMoreList
                        items={jobTitle.permissions}
                        onShowMore={() =>
                          handleShowMore(
                            "permissions",
                            t("Permissions"),
                            jobTitle.permissions
                          )
                        }
                        isLightMode={isLightMode}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <TruncatedText text={jobTitle.department?.name} />
                    </td>
                    {(isAdmin || hasEditPermission) && (
                      <td className="py-3 px-4 flex justify-center">
                        <NavigateButton
                          data={jobTitle}
                          className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                        >
                          <Image
                            src={PencilIcon}
                            alt="edit icon"
                            height={20}
                            width={20}
                          />
                        </NavigateButton>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {modalContent && (
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalContent(null);
          }}
          title={modalContent.title}
          content={modalContent.content}
          language={currentLanguage as "en" | "ar"}
          actionText={t("Close")}
        />
      )}
    </div>
  );
};

export default JobTitleContent;
