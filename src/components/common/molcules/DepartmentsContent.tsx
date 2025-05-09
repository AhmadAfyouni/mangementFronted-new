import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { DepartmentType } from "@/types/DepartmentType.type";
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
    window.open(url, "_blank");
  };

  // Filter visible columns for better organization
  const visibleColumns = [
    { id: "name", label: "Name" },
    { id: "category", label: "Category" },
    { id: "parent", label: "Parent Department" },
    { id: "goal", label: "Goal" },
    { id: "description", label: "Description" },
    { id: "mainTasks", label: "Main Tasks" },
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

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col gap-4 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-main text-twhite rounded-lg shadow-md border-collapse">
          <thead
            className={`${isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"
              } sticky top-0 z-10`}
          >
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-start py-3 px-4 uppercase font-semibold text-sm"
                >
                  {t(column.label)}
                </th>
              ))}
              {(isAdmin || hasEditPermission) && (
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {departmentsData && departmentsData.length > 0 ? (
              departmentsData.map((department) => (
                <tr
                  key={department.id}
                  className={`${isLightMode
                    ? "hover:bg-darker text-blackAF hover:text-tblackAF border-b border-gray-200"
                    : "hover:bg-slate-700 text-twhite border-b border-gray-800"
                    } transition-colors`}
                >
                  {/* Name */}
                  <td className="py-4 px-4">
                    <div className="font-medium">{department.name}</div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <div className="inline-block py-1 px-3 rounded-full bg-blue-500 bg-opacity-20 text-blue-400 text-xs">
                      {department.category}
                    </div>
                  </td>

                  {/* Parent Department */}
                  <td className="py-4 px-4">
                    {department.parent_department
                      ? departmentsData.find(
                        (dep) => dep.id === department.parent_department
                      )?.name || "-"
                      : "—"}
                  </td>

                  {/* Goal */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.goal,
                      `${department.name} - ${t("Goal")}`
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.description,
                      `${department.name} - ${t("Description")}`
                    )}
                  </td>

                  {/* Main Tasks */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.mainTasks,
                      `${department.name} - ${t("Main Tasks")}`
                    )}
                  </td>

                  {/* Files & Reports - Now shows a button to open modal */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() =>
                        setFilesReportsModal({ isOpen: true, department })
                      }
                      className={`px-4 py-2 rounded-md transition-colors ${isLightMode
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
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
                        <span>{t("View Files & Reports")}</span>
                      </div>
                    </button>
                  </td>

                  {/* Development Programs - Now shows a button to open modal */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() =>
                        setDevelopmentProgramsModal({
                          isOpen: true,
                          department,
                        })
                      }
                      className={`px-4 py-2 rounded-md transition-colors ${isLightMode
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        <span>{t("View Programs")}</span>
                      </div>
                    </button>
                  </td>

                  {/* Actions */}
                  {(isAdmin || hasEditPermission) && (
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        {(isAdmin || hasEditPermission) && (
                          <NavigateButton
                            data={department}
                            className="cursor-pointer p-2 w-10 h-10 flex justify-center items-center rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 transition-colors"
                          >
                            <Image
                              src={PencilIcon}
                              alt="edit icon"
                              height={18}
                              width={18}
                            />
                          </NavigateButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + (isAdmin || hasEditPermission ? 1 : 0)}
                  className="py-6 px-4 text-center text-gray-400"
                >
                  {t("No departments found matching your search criteria.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {departmentsData && departmentsData.length > 0 && (
        <div className={`flex flex-col md:flex-row justify-between items-center mt-4 px-2 ${isLightMode ? "text-blackAF" : "text-twhite"
          }`}>
          <div className="mb-4 md:mb-0">
            <span>{t("Showing")} </span>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
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
            <span>{t("of")} {pagination.totalItems} {t("items")}</span>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${pagination.currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              «
            </button>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${pagination.currentPage === 1
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
                onClick={() => pagination.onPageChange(page)}
                className={`mx-1 px-3 py-1 rounded ${pagination.currentPage === page
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
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`mx-1 px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              ›
            </button>

            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`mx-1 px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages
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