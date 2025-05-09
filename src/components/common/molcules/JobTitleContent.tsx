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
import { useEffect, useState } from "react";
import CustomModal from "../atoms/modals/CustomModal";
import PageSpinner from "../atoms/ui/PageSpinner";
import { Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";
import { setActiveEntity } from "@/state/slices/searchSlice";

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
            ${isLightMode
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

  // Get search query from Redux
  const searchQuery = useSelector((state: RootState) =>
    state.globalSearch.queries.jobTitles);
  const dispatch = useDispatch();

  // Set active entity for global search when component mounts
  useEffect(() => {
    dispatch(setActiveEntity('jobTitles'));
  }, [dispatch]);

  const { data: jobs, isLoading } = useCustomQuery<{ data: JobTitleType[] }>({
    queryKey: ["jobTitles", selectedOption],
    url:
      selectedOption === "view"
        ? `/job-titles/view`
        : `/job-titles/get-job-titles`,
  });

  // Search configuration
  const searchConfig: SearchConfig<JobTitleType> = {
    searchFields: ['title', 'description'] as Array<keyof JobTitleType>,
    customFilterFn: (item,) => {
      // If we have a search query, check if it matches any field
      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        // Search in title and description
        const matchesTitle = item.title?.toLowerCase().includes(query) || false;
        const matchesDescription = item.description?.toLowerCase().includes(query) || false;

        // Search in responsibilities
        const matchesResponsibilities = item.responsibilities?.some(
          resp => resp.toLowerCase().includes(query)
        ) || false;

        // Search in permissions
        const matchesPermissions = item.permissions?.some(
          perm => perm.toLowerCase().includes(query)
        ) || false;

        // Search in department name
        const matchesDepartment = item.department?.name?.toLowerCase().includes(query) || false;

        // Return true if any field matches
        return matchesTitle || matchesDescription || matchesResponsibilities ||
          matchesPermissions || matchesDepartment;
      }

      // If no search query, include all items
      return true;
    }
  };

  // Use the global search hook to filter job titles
  const {
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
  } = useGlobalSearch('jobTitles', jobs?.data || [], searchConfig);

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

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Calculate start and end page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const { NavigateButton } = useSetPageData<JobTitleType>("/jobs/add-title");

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col gap-4 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        {!jobs || jobs.data.length === 0 || paginatedData.length === 0 ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5 text-twhite">
              {searchQuery
                ? t("No job titles found matching your search criteria.")
                : t("No Job Titles Found")}
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
                {paginatedData && paginatedData.length > 0 && paginatedData.map((jobTitle) => (
                  <tr
                    key={jobTitle.id}
                    className={`
                      ${isLightMode
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

      {/* Pagination Controls */}
      {paginatedData && paginatedData.length > 0 && (
        <div className={`flex flex-col md:flex-row justify-between items-center mt-4 px-2 ${isLightMode ? "text-blackAF" : "text-twhite"
          }`}>
          <div className="mb-4 md:mb-0">
            <span>{t("Showing")} </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className={`px-2 py-1 rounded mx-1 ${isLightMode
                ? "bg-white text-black border border-gray-300"
                : "bg-tblack text-white border border-gray-700"
                }`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>{t("of")} {totalItems} {t("items")}</span>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              «
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              ‹
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === page
                  ? isLightMode
                    ? "bg-tmid text-main"
                    : "bg-tmid text-main"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                    : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              ›
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              »
            </button>
          </div>
        </div>
      )}

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