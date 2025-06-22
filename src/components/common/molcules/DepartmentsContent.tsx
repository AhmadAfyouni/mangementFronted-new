import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { DepartmentType } from "@/types/DepartmentType.type";
import { Briefcase, Building2, FileText, Users, Hash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { DevelopmentProgramsModal, FilesReportsModal, TextModal } from "./departments/DepartmentsComponents";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

interface TextModalState {
  isOpen: boolean;
  content: string;
  title: string;
}

interface DepartmentsContentProps {
  departmentsData: DepartmentType[];
  pagination: PaginationProps;
}

const DepartmentRowComponent: React.FC<{
  department: DepartmentType;
  isAdmin: boolean;
  hasEditPermission: boolean;
  NavigateButton: any;
  t: (key: string) => string;
  onOpenFilesModal: (department: DepartmentType) => void;
  onOpenProgramsModal: (department: DepartmentType) => void;
  onViewText: (content: string, title: string) => void;
  departmentsData: DepartmentType[];
}> = ({
  department,
  isAdmin,
  hasEditPermission,
  NavigateButton,
  t,
  onOpenFilesModal,
  onOpenProgramsModal,
  onViewText,
  departmentsData
}) => {

    const getCategoryStyles = (category: string) => {
      if (category === 'primary-department') {
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          icon: <Building2 className="w-3 h-3 flex-shrink-0" />
        };
      } else if (category === 'secondary-department') {
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          icon: <Briefcase className="w-3 h-3 flex-shrink-0" />
        };
      } else {
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500/30',
          icon: <Users className="w-3 h-3 flex-shrink-0" />
        };
      }
    };

    const getPriorityBorderColor = (category: string) => {
      if (category === 'primary-department') {
        return 'border-l-blue-500';
      } else if (category === 'secondary-department') {
        return 'border-l-purple-500';
      } else {
        return 'border-l-green-500';
      }
    };

    const handleLongText = (text: string | undefined, maxLength = 50): React.ReactNode => {
      if (!text) return <span className="text-gray-500">{t("No Goal Set")}</span>;

      if (text.length <= maxLength) return text;

      return (
        <div>
          <span>{text.substring(0, maxLength)}...</span>
          <button
            className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
            onClick={() => onViewText(text, `${department.name} - ${t("Goal")}`)}
          >
            {t("View More")}
          </button>
        </div>
      );
    };

    const categoryStyles = getCategoryStyles(department.category);

    return (
      <div
        className={`grid grid-cols-7 gap-6 px-8 py-4 group border-l-4 ${getPriorityBorderColor(department.category)} hover:bg-secondary/50 transition-all duration-300 bg-dark border-b border-1 border-main`}
      >
        {/* Department ID */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-400 hover:text-blue-300">
            {department.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Department Info */}
        <div className="flex items-center pr-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${categoryStyles.bg}`}>
              {categoryStyles.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300 truncate">
                {department.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Hash className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{department.category.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center px-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${categoryStyles.bg} ${categoryStyles.text} ${categoryStyles.border}`}>
            {categoryStyles.icon}
            <span className="truncate">{department.category.replace('-', ' ')}</span>
          </span>
        </div>

        {/* Parent Department */}
        <div className="flex items-center px-4">
          {department.parent_department ? (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {departmentsData.find(
                  (dep) => dep.id === department.parent_department?.id
                )?.name || t("Unknown")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="truncate">{t("Main Department")}</span>
            </div>
          )}
        </div>

        {/* Goal */}
        <div className="flex items-center px-4">
          <div className="text-sm text-gray-300 truncate">
            {handleLongText(department.goal)}
          </div>
        </div>

        {/* Files & Reports */}
        <div className="flex items-center px-4">
          <button
            onClick={() => onOpenFilesModal(department)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-blue-900/30 transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            <span>
              {(department.supportingFiles?.length || 0) + (department.requiredReports?.length || 0)}
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pl-4">
          {/* Programs Button */}
          <button
            onClick={() => onOpenProgramsModal(department)}
            className="flex items-center gap-1 p-2 rounded-lg bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30 border border-emerald-900/30 transition-all duration-200"
            title={t("Development Programs")}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-medium">{department.developmentPrograms?.length || 0}</span>
          </button>

          {/* Edit Button */}
          {(isAdmin || hasEditPermission) && (
            <NavigateButton
              data={department}
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

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
  t: (key: string) => string;
}> = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems, t }) => {
  const getVisiblePages = () => {
    const delta = 2;
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
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-dark border-t border-gray-700">
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{t("Show")}</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-secondary border border-gray-600 text-twhite rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-400">{t("per page")}</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-400">
        {t("Showing")} {startItem} {t("to")} {endItem} {t("of")} {totalItems} {t("results")}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("First page")}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Previous page")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? 'bg-blue-500 text-white border border-blue-500'
                    : 'border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50'
                    }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Next page")}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Last page")}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const DepartmentsContent: React.FC<DepartmentsContentProps> = ({
  departmentsData,
  pagination,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["department_updatesss"]);
  const { NavigateButton } = useSetPageData<DepartmentType>(
    "/departments/add-department"
  );

  // State for modals
  const [textModal, setTextModal] = useState<TextModalState>({
    isOpen: false,
    content: "",
    title: "",
  });

  const [filesReportsModal, setFilesReportsModal] = useState<{
    isOpen: boolean;
    department: DepartmentType | null;
  }>({
    isOpen: false,
    department: null,
  });

  const [developmentProgramsModal, setDevelopmentProgramsModal] = useState<{
    isOpen: boolean;
    department: DepartmentType | null;
  }>({
    isOpen: false,
    department: null,
  });

  // Function to open file
  const handleOpenFile = (url: string) => {
    if (!url) return;

    // Make sure the URL is properly formatted
    let fullUrl = url;

    // Check if URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }

    // Prevent duplicate URL issues
    if (fullUrl.includes('http://http://') || fullUrl.includes('https://https://')) {
      fullUrl = fullUrl.replace('http://http://', 'http://');
      fullUrl = fullUrl.replace('https://https://', 'https://');
    }

    console.log('Opening URL:', fullUrl);
    window.open(fullUrl, "_blank");
  };

  const handleViewText = (content: string, title: string) => {
    setTextModal({ isOpen: true, content, title });
  };

  const handleOpenFilesModal = (department: DepartmentType) => {
    setFilesReportsModal({ isOpen: true, department });
  };

  const handleOpenProgramsModal = (department: DepartmentType) => {
    setDevelopmentProgramsModal({ isOpen: true, department });
  };

  return (
    <div className="rounded-xl shadow-md flex flex-col gap-4 col-span-12">
      {/* Departments Table */}
      <div className="overflow-hidden rounded-lg shadow-lg shadow-black/20 border border-gray-700/50">
        {!departmentsData || departmentsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Building2 className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">{t("No Departments Found")}</h3>
            <p className="text-tdark">{t("There are no departments in the system. Add departments to see them listed here.")}</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-secondary/50 border-b border-gray-700">
              <div className="grid grid-cols-7 gap-6 px-8 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Hash className="w-4 h-4 text-blue-400" />
                  {t("Department ID")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  {t("Department")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  {t("Category")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Users className="w-4 h-4 text-green-400" />
                  {t("Parent")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {t("Goal")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {t("Files")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <Briefcase className="w-4 h-4 text-yellow-400" />
                  {t("Actions")}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {departmentsData.map((department) => (
                <DepartmentRowComponent
                  key={department.id}
                  department={department}
                  isAdmin={isAdmin}
                  hasEditPermission={hasEditPermission}
                  NavigateButton={NavigateButton}
                  t={t}
                  onOpenFilesModal={handleOpenFilesModal}
                  onOpenProgramsModal={handleOpenProgramsModal}
                  onViewText={handleViewText}
                  departmentsData={departmentsData}
                />
              ))}
            </div>

            {/* Pagination */}
            {departmentsData.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                itemsPerPage={pagination.itemsPerPage}
                onItemsPerPageChange={pagination.onItemsPerPageChange}
                totalItems={pagination.totalItems}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {/* Text Modal */}
      {textModal.isOpen && (
        <TextModal
          content={textModal.content}
          title={textModal.title}
          onClose={() =>
            setTextModal({ isOpen: false, content: "", title: "" })
          }
        />
      )}

      {/* Files & Reports Modal */}
      {filesReportsModal.isOpen && filesReportsModal.department && (
        <FilesReportsModal
          department={filesReportsModal.department}
          onClose={() =>
            setFilesReportsModal({ isOpen: false, department: null })
          }
          onOpenFile={handleOpenFile}
        />
      )}

      {/* Development Programs Modal */}
      {developmentProgramsModal.isOpen &&
        developmentProgramsModal.department && (
          <DevelopmentProgramsModal
            department={developmentProgramsModal.department}
            onClose={() =>
              setDevelopmentProgramsModal({ isOpen: false, department: null })
            }
            onOpenFile={handleOpenFile}
            onViewText={(content, title) =>
              setTextModal({ isOpen: true, content, title })
            }
          />
        )}
    </div>
  );
};

export default DepartmentsContent;