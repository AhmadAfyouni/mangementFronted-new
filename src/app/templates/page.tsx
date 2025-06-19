"use client";
import { useState, useMemo } from "react";
import TemplateCard from "@/components/common/atoms/templates/TemplateCard";
import TemplateEmptyState from "@/components/common/atoms/templates/TemplateEmptyState";
import TemplateLoadingSkeleton from "@/components/common/atoms/templates/TemplateLoadingSkeleton";
import ErrorState from "@/components/common/atoms/ui/ErrorState";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { templateType } from "@/types/new-template.type";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const calculateActiveDepartments = (templates: templateType[] | undefined) => {
  if (!templates) return 0;

  const uniqueDeptIds = new Set(
    templates.flatMap((t) => [
      ...t.departments_approval_track.map((d) => d.department._id),
      ...t.departments_execution_ids.map((d) => d.department._id),
      // ...t.departments_archive.map((d) => d._id),
    ])
  );

  return uniqueDeptIds.size;
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  t: (key: string) => string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  t
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-secondary rounded-lg">
      {/* Results Info */}
      <div className="text-sm text-tmid">
        {t("Showing")} <span className="font-medium text-twhite">{startItem}</span> {t("to")} <span className="font-medium text-twhite">{endItem}</span> {t("of")} <span className="font-medium text-twhite">{totalItems}</span> {t("results")}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-tmid hover:text-twhite disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("Previous")}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <div key={`dots-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 text-tmid" />
                </div>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isCurrentPage
                  ? 'bg-tblack text-twhite border border-gray-600'
                  : 'text-tmid hover:text-twhite hover:bg-dark'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-tmid hover:text-twhite disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark rounded-lg transition-colors"
        >
          {t("Next")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Items Per Page Selector
interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  t: (key: string) => string;
}

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  t
}) => {
  const options = [5, 10, 20, 50];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-tmid">{t("Show")}</span>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="bg-secondary border border-gray-600 rounded px-2 py-1 text-twhite focus:border-blue-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <span className="text-tmid">{t("per page")}</span>
    </div>
  );
};

// Main Templates Component
const Templates = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useCustomQuery<templateType[]>({
    url: "/templates",
    queryKey: ["templates"],
  });

  // Calculate pagination
  const { paginatedTemplates, totalPages } = useMemo(() => {
    if (!templates) return { paginatedTemplates: [], totalPages: 0 };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTemplates = templates.slice(startIndex, endIndex);
    const totalPages = Math.ceil(templates.length / itemsPerPage);

    return { paginatedTemplates, totalPages };
  }, [templates, currentPage, itemsPerPage]);

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset to first page when templates change
  useMemo(() => {
    setCurrentPage(1);
  }, [templates]);

  const renderHeader = () => (
    <div className="col-span-full mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-twhite mb-2">
            {t("Transaction Templates")}
          </h1>
          <p className="text-tmid text-sm">
            {t("Select a template to initiate a new transaction")}
          </p>
        </div>
        <RouteWrapper href="/templates/add-template">
          <button className="bg-tblack hover:bg-dark text-twhite px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("Add New Template")}
          </button>
        </RouteWrapper>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-700/50 pb-6 mb-6">
      {/* Total Templates */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Total Templates")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {templates?.length || 0}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>

      {/* With Admin Approval */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Requires Approval")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {templates?.filter((t) => t.needAdminApproval).length || 0}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      {/* Active Departments */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Active Departments")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {calculateActiveDepartments(templates)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-secondary rounded-xl p-8">
          <ErrorState
            message={t("Failed to load templates")}
            showRetry={true}
            onRetry={refetch}
          />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="bg-secondary rounded-xl p-6 gap-6">
          {[...Array(3)].map((_, i) => (
            <TemplateLoadingSkeleton key={`loading-${i}`} />
          ))}
        </div>
      );
    }

    if (!templates?.length) {
      return (
        <div className="bg-secondary rounded-xl p-8">
          <TemplateEmptyState t={t} />
        </div>
      );
    }

    return (
      <div className="bg-dark rounded-xl p-6">
        {/* Items per page selector */}
        <div className="flex justify-between items-center mb-6">
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            t={t}
          />
          <div className="text-sm text-tmid">
            {t("Page")} {currentPage} {t("of")} {totalPages}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex flex-col justify-center gap-2">
          {paginatedTemplates.map((template, index) => (
            <TemplateCard key={template._id || index} template={template} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={templates.length}
          itemsPerPage={itemsPerPage}
          t={t}
        />
      </div>
    );
  };

  return (
    <GridContainer>
      {renderHeader()}
      {renderStats()}
      {renderContent()}
    </GridContainer>
  );
};

export default Templates;