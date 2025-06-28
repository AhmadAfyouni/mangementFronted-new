"use client";

import { PencilIcon } from "@/assets";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { setActiveEntity } from "@/state/slices/searchSlice";
import { RootState } from "@/state/store";
import { JobCategoryType } from "@/types/JobTitle.type";
import { BookOpen, Briefcase, Clock, GraduationCap, Hash, Star } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomModal from "../atoms/modals/CustomModal";
import { Pagination } from "../atoms/Pagination";
import PageSpinner from "../atoms/ui/PageSpinner";

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

const JobCategoryRowComponent: React.FC<{
  category: JobCategoryType;
  isAdmin: boolean;
  hasEditPermission: boolean;
  NavigateButton: any;
  t: (key: string) => string;
  onShowMoreSkills: (skills: string[]) => void;
}> = ({ category, isAdmin, hasEditPermission, NavigateButton, t, onShowMoreSkills }) => {

  const getCategoryColor = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("technical") || nameLower.includes("developer") || nameLower.includes("engineer")) {
      return 'border-l-purple-500';
    } else if (nameLower.includes("management") || nameLower.includes("manager") || nameLower.includes("director")) {
      return 'border-l-blue-500';
    } else if (nameLower.includes("design") || nameLower.includes("creative")) {
      return 'border-l-pink-500';
    } else if (nameLower.includes("sales") || nameLower.includes("marketing")) {
      return 'border-l-amber-500';
    } else if (nameLower.includes("finance") || nameLower.includes("accounting")) {
      return 'border-l-green-500';
    } else {
      return 'border-l-teal-500';
    }
  };

  const getEducationBadgeColor = (education: string) => {
    const eduLower = education.toLowerCase();
    if (eduLower.includes("phd") || eduLower.includes("doctorate")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (eduLower.includes("master") || eduLower.includes("mba")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else if (eduLower.includes("bachelor") || eduLower.includes("degree")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (eduLower.includes("associate") || eduLower.includes("diploma")) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else {
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getExperienceBadgeColor = (experience: string) => {
    const expLower = experience.toLowerCase();
    if (expLower.includes("senior") || expLower.includes("10+") || expLower.includes("expert")) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    } else if (expLower.includes("mid") || expLower.includes("5+") || expLower.includes("intermediate")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else if (expLower.includes("junior") || expLower.includes("entry") || expLower.includes("1+")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else {
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleLongText = (text: string | undefined, maxLength = 50): React.ReactNode => {
    if (!text) return <span className="text-gray-500">{t("N/A")}</span>;

    if (text.length <= maxLength) return text;

    return (
      <div>
        <span>{text.substring(0, maxLength)}...</span>
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-6 gap-6 px-8 py-4 group border-l-4 ${getCategoryColor(category.name)} hover:bg-secondary/50 transition-all duration-300 bg-dark border-b border-1 border-main`}
    >
      {/* Category ID */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-blue-400 hover:text-blue-300">
          {category.id.slice(-5).toUpperCase()}
        </span>
      </div>

      {/* Category Info */}
      <div className="flex items-center pr-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
            {category.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300 truncate">
              {category.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{handleLongText(category.description, 30)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="flex items-center px-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getEducationBadgeColor(category.required_education)}`}>
          <GraduationCap className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{category.required_education || t("Not Specified")}</span>
        </span>
      </div>

      {/* Experience */}
      <div className="flex items-center px-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getExperienceBadgeColor(category.required_experience)}`}>
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{category.required_experience || t("Not Specified")}</span>
        </span>
      </div>

      {/* Skills */}
      <div className="flex items-center px-4">
        {category.required_skills && category.required_skills.length > 0 ? (
          <button
            onClick={() => onShowMoreSkills(category.required_skills)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-purple-900/20 text-purple-400 hover:bg-purple-900/30 border border-purple-900/30 transition-all duration-200"
          >
            <Star className="w-4 h-4" />
            <span>{category.required_skills.length} {t("Skills")}</span>
          </button>
        ) : (
          <span className="text-gray-500 text-sm">{t("None")}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pl-4">
        {(isAdmin || hasEditPermission) && (
          <NavigateButton
            data={category}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 border border-gray-600/20 hover:border-green-500/30"
            title={t("Edit")}
          >
            <Image
              src={PencilIcon}
              alt="edit icon"
              height={16}
              width={16}
            />
          </NavigateButton>
        )}
      </div>
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
    customFilterFn: (item,) => {
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
    return <PageSpinner />;
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

  return (
    <div className="rounded-xl shadow-md flex flex-col gap-4 col-span-12">
      {/* Job Categories Table */}
      <div className="overflow-hidden rounded-lg shadow-lg shadow-black/20 border border-gray-700/50">
        {!categories || categories.length === 0 || (displayData && displayData.length === 0 && searchQuery) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Briefcase className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">
              {!categories || categories.length === 0
                ? t("No Job Categories Found")
                : t("No Results Found")}
            </h3>
            <p className="text-tdark">
              {!categories || categories.length === 0
                ? t("There are no job categories in the system. Add job categories to see them listed here.")
                : t("No job categories found matching your search criteria.")}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-secondary/50 border-b border-gray-700">
              <div className="grid grid-cols-6 gap-6 px-8 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Hash className="w-4 h-4 text-blue-400" />
                  {t("Category ID")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Briefcase className="w-4 h-4 text-teal-400" />
                  {t("Category")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  {t("Education")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Clock className="w-4 h-4 text-green-400" />
                  {t("Experience")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Star className="w-4 h-4 text-purple-400" />
                  {t("Skills")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  {t("Actions")}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {displayData && displayData.map((category) => (
                <JobCategoryRowComponent
                  key={category.id}
                  category={category}
                  isAdmin={isAdmin}
                  hasEditPermission={hasEditPermission}
                  NavigateButton={NavigateButton}
                  t={t}
                  onShowMoreSkills={handleShowMoreSkills}
                />
              ))}
            </div>

            {/* Pagination - Only show if we're handling pagination internally */}
            {!pagination && displayData && displayData.length > 0 && totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalItems}
                t={t}
              />
            )}
          </>
        )}
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t("Required Skills")}
        content={modalContent}
        language={currentLanguage as "en" | "ar"}
        actionText={t("Close")}
      />
    </div>
  );
};

export default JobCategoryContent;