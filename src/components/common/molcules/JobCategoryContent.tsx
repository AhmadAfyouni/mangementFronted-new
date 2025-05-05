"use client";

import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { JobCategoryType } from "@/types/JobTitle.type";
import Image from "next/image";
import { useEffect, useState } from "react";
import CustomModal from "../atoms/modals/CustomModal";
import PageSpinner from "../atoms/ui/PageSpinner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { setActiveEntity } from "@/state/slices/searchSlice";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

interface JobCategoryContentProps {
  pagination?: PaginationProps; // Optional prop for external pagination control
}

const SkillsList = ({
  skills,
  onShowMore,
}: {
  skills: string[];
  onShowMore: () => void;
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const shouldShowMore = skills.length > 2;
  const displaySkills = skills.slice(0, 2);

  return (
    <div className="flex flex-col gap-2">
      <ul className="list-disc ml-4">
        {displaySkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      {shouldShowMore && (
        <button
          onClick={onShowMore}
          className={`
            flex items-center justify-center gap-2 
            mt-1 py-1 px-2 rounded-lg
            text-xs font-medium transition-all duration-200
            ${isLightMode
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary/20 text-primary hover:bg-primary/30"
            }
          `}
        >
          <span>{t("Show More")}</span>
          <span className="text-xs opacity-60">(+{skills.length - 2})</span>
        </button>
      )}
    </div>
  );
};

const JobCategoryContent: React.FC<JobCategoryContentProps> = ({ pagination }) => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["job_title_category_update"]);
  const {
    data: categories,
    isLoading,
    error,
  } = useCustomQuery<JobCategoryType[]>({
    queryKey: ["jobTitles"],
    url: `/job-categories`,
  });
  const { isLightMode } = useCustomTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string[]>([]);

  // Get search state from Redux
  const searchQuery = useSelector((state: RootState) =>
    state.globalSearch.queries.jobCategories);
  const dispatch = useDispatch();

  // Set active entity for global search
  useEffect(() => {
    dispatch(setActiveEntity('jobCategories'));
  }, [dispatch]);

  // Configure search if we need to handle our own pagination
  const searchConfig: SearchConfig<JobCategoryType> = {
    searchFields: ['name', 'description', 'required_education', 'required_experience'] as Array<keyof JobCategoryType>,
    customFilterFn: (item, filters) => {
      // If item has required_skills array, search in them too
      if (searchQuery && item.required_skills && item.required_skills.length > 0) {
        const matchInSkills = item.required_skills.some(skill =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matchInSkills) return true;
      }
      return true; // Default let the main search in searchFields handle it
    }
  };

  // Use global search if pagination is not provided externally
  const {
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
  } = useGlobalSearch('jobCategories', categories || [], searchConfig);

  // Determine which data to use: If pagination is provided use all data, otherwise use paginatedData
  const displayData = pagination ? categories : paginatedData;

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Get pagination values from props or from our hook
    const currentPagination = pagination || {
      currentPage,
      totalPages,
    };

    // Calculate start and end page numbers to show
    let startPage = Math.max(1, currentPagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(currentPagination.totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleShowMoreSkills = (skills: string[]) => {
    setModalContent(skills);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent([]);
  };

  const { NavigateButton } = useSetPageData<JobCategoryType>(
    "/categories/add-category"
  );

  if (isLoading || !categories) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5 text-twhite">
        {t("No Job Categories Found")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">
          {t("Failed to load job categories.")}
        </p>
      </div>
    );
  }

  // Handle the case where search results in no matches
  if (!displayData || (displayData.length === 0 && searchQuery)) {
    return (
      <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col gap-4 col-span-12">
        <div className="text-center text-twhite py-8">
          {t("No job categories found matching your search criteria.")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col gap-4 col-span-12">
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-main text-twhite rounded-lg shadow-md">
          <thead
            className={` ${isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"
              }  `}
          >
            <tr>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Name")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Description")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Education")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Experience")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Skills")}
              </th>
              {(isAdmin || hasEditPermission) && (
                <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData &&
              displayData.map((category) => (
                <tr
                  key={category.id}
                  className={` ${isLightMode
                    ? "hover:bg-darker text-blackAF hover:text-tblackAF"
                    : "hover:bg-slate-700 text-twhite"
                    }  group transition-colors`}
                >
                  <td className="py-3 px-4 text-center">
                    {category && category.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.required_education}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.required_experience}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category &&
                      category.required_skills &&
                      category.required_skills.length > 0 ? (
                      <SkillsList
                        skills={category.required_skills}
                        onShowMore={() =>
                          handleShowMoreSkills(category.required_skills)
                        }
                      />
                    ) : (
                      t("N/A")
                    )}
                  </td>
                  {(isAdmin || hasEditPermission) && (
                    <td className="py-3 px-4 flex gap-2">
                      {(isAdmin || hasEditPermission) && (
                        <NavigateButton
                          data={category}
                          className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                        >
                          <Image
                            src={PencilIcon}
                            alt="edit icon"
                            height={20}
                            width={20}
                          />
                        </NavigateButton>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Only show if we're handling pagination internally */}
      {!pagination && displayData && displayData.length > 0 && (
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

      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t("Skills")}
        content={modalContent}
        language={currentLanguage as "en" | "ar"}
        actionText={t("Close")}
      />
    </div>
  );
};

export default JobCategoryContent;