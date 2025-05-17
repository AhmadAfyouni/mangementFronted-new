import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { DepartmentType } from "@/types/DepartmentType.type";
import { Briefcase, Building2, FileText, Users } from "lucide-react";
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



  // State for Files & Reports and Development Programs modals
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

  // Function to handle long text
  const handleLongText = (
    text: string | undefined,
    title: string,
    maxLength = 100
  ): React.ReactNode => {
    if (!text) return "-";

    if (text.length <= maxLength) return text;

    return (
      <div>
        <span>{text.substring(0, maxLength)}...</span>
        <button
          className="ml-2 text-blue-500 hover:underline focus:outline-none"
          onClick={() => setTextModal({ isOpen: true, content: text, title })}
        >
          {t("View More")}
        </button>
      </div>
    );
  };

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

  // Filter visible columns for better organization
  const visibleColumns = [
    { id: "name", label: "Name" },
    { id: "category", label: "Category" },
    { id: "parent", label: "Parent Department" },
    { id: "goal", label: "Goal" },
    { id: "files", label: "Files & Reports" },
    { id: "programs", label: "Development Programs" },
  ];

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Calculate start and end page numbers to show
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Get the appropriate color based on category
  const getCategoryStyles = (category: string) => {
    if (category === 'primary-department') {
      return {
        bg: isLightMode ? 'bg-blue-100' : 'bg-blue-900/30',
        text: 'text-blue-500',
        icon: <Building2 className="w-4 h-4 text-blue-500" />
      };
    } else if (category === 'secondary-department') {
      return {
        bg: isLightMode ? 'bg-purple-100' : 'bg-purple-900/30',
        text: 'text-purple-500',
        icon: <Briefcase className="w-4 h-4 text-purple-500" />
      };
    } else {
      return {
        bg: isLightMode ? 'bg-green-100' : 'bg-green-900/30',
        text: 'text-green-500',
        icon: <Users className="w-4 h-4 text-green-500" />
      };
    }
  };

  return (
    <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-6 col-span-12`}>
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-main rounded-xl shadow-lg border-separate border-spacing-0">
          <thead>
            <tr className={`${isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"} sticky top-0 z-10`}>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-start py-4 px-5 first:rounded-tl-xl last:rounded-tr-xl uppercase font-semibold text-sm"
                >
                  {t(column.label)}
                </th>
              ))}
              <th className="text-center py-4 px-5 uppercase font-semibold text-sm rounded-tr-xl">
                {t("Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {departmentsData && departmentsData.length > 0 ? (
              departmentsData.map((department) => {
                const categoryStyles = getCategoryStyles(department.category);

                return (
                  <tr
                    key={department.id}
                    className={`${isLightMode
                      ? "hover:bg-gray-100 text-gray-800 divide-gray-200"
                      : "hover:bg-dark text-twhite divide-gray-800"
                      } transition-all duration-200`}
                  >
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryStyles.bg}`}>
                          {categoryStyles.icon}
                        </div>
                        <div>
                          <div className="font-semibold">{department.name}</div>
                          <div className="text-xs text-gray-500">
                            {t("ID")}: {department.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5">
                      <div className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full ${categoryStyles.bg} ${categoryStyles.text} text-xs font-medium`}>
                        {department.category}
                      </div>
                    </td>

                    {/* Parent Department */}
                    <td className="py-4 px-5">
                      {department.parent_department
                        ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>
                              {departmentsData.find(
                                (dep) => dep.id === department.parent_department?.id
                              )?.name || "-"}
                            </span>
                          </div>
                        )
                        : (
                          <div className="text-gray-500 font-medium">
                            {t("Main Department")}
                          </div>
                        )
                      }
                    </td>

                    {/* Goal */}
                    <td className="py-4 px-5">
                      {handleLongText(
                        department.goal,
                        `${department.name} - ${t("Goal")}`
                      )}
                    </td>

                    {/* Files & Reports */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() =>
                          setFilesReportsModal({ isOpen: true, department })
                        }
                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm ${isLightMode
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow"
                          : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 hover:shadow"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>
                            {department.supportingFiles?.length || 0} {t("Files")}, {department.requiredReports?.length || 0} {t("Reports")}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Development Programs */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() =>
                          setDevelopmentProgramsModal({
                            isOpen: true,
                            department,
                          })
                        }
                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm ${isLightMode
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow"
                          : "bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30 hover:shadow"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>
                            {department.developmentPrograms?.length || 0} {t("Programs")}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex justify-center gap-2">
                        {/* Edit Button */}
                        {(isAdmin || hasEditPermission) && (
                          <NavigateButton
                            data={department}
                            className="cursor-pointer p-2 w-10 h-10 flex justify-center items-center rounded-lg bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 transition-colors shadow hover:shadow-md"
                          >
                            <Image
                              src={PencilIcon}
                              alt="edit icon"
                              height={20}
                              width={20}
                            />
                          </NavigateButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="py-8 px-5 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-400 text-lg font-medium">
                      {t("No departments found matching your search criteria.")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Improved Pagination Controls */}
      {departmentsData && departmentsData.length > 0 && (
        <div className={`flex flex-col md:flex-row justify-between items-center px-2 ${isLightMode ? "text-blackAF" : "text-twhite"}`}>
          <div className="mb-4 md:mb-0 bg-secondary py-2 px-4 rounded-lg shadow-sm">
            <span>{t("Showing")} </span>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-1 rounded-md mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLightMode
                ? "bg-white text-black border border-gray-300"
                : "bg-dark text-white border border-gray-700"
                }`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>{t("of")} {pagination.totalItems} {t("items")}</span>
          </div>

          <div className="flex items-center bg-secondary py-1 px-2 rounded-lg shadow-sm">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${pagination.currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                  : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                }`}
            >
              «
            </button>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${pagination.currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                  : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                }`}
            >
              ‹
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => pagination.onPageChange(page)}
                className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${pagination.currentPage === page
                  ? isLightMode
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-blue-600 text-white shadow-md"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                    : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${pagination.currentPage === pagination.totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                  : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                }`}
            >
              ›
            </button>

            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${pagination.currentPage === pagination.totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                  : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                }`}
            >
              »
            </button>
          </div>
        </div>
      )}

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