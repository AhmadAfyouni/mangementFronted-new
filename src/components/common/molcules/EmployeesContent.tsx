"use client";

import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useSetPageData from "@/hooks/useSetPageData";
import { EmployeeType } from "@/types/EmployeeType.type";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import FilesButton from "../atoms/employees/FilesDropdown";
import { Building2, Briefcase, Users, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useState } from "react";

interface EmployeesContentProps {
  employeesData: EmployeeType[];
}

const EmployeesContent: React.FC<EmployeesContentProps> = ({ employeesData }) => {
  const { t } = useTranslation();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["emp_update"]);
  const { isLightMode } = useCustomTheme();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { NavigateButton } = useSetPageData<EmployeeType>(
    "/employees/add-employee"
  );

  // Get the search term from the global header if it exists
  const getGlobalSearchTerm = (): string => {
    // This would typically be fetched from a global state or context
    // For now, we'll check if there's a search input in the header
    const headerSearchInput = document.querySelector<HTMLInputElement>('[data-search-header]');
    return headerSearchInput?.value || '';
  };

  // Filter employees based on global search
  const filteredEmployees = employeesData.filter(employee => {
    const searchTerm = getGlobalSearchTerm().toLowerCase();
    if (!searchTerm) return true;

    return (
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm) ||
      employee.job.title.toLowerCase().includes(searchTerm) ||
      (employee.department?.name && employee.department.name.toLowerCase().includes(searchTerm))
    );
  });

  // Paginate employees
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Function to get page numbers for pagination
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

  // Function to get appropriate badge color based on department
  const getDepartmentColor = (deptName?: string) => {
    if (!deptName) return "bg-gray-500/20 text-gray-400";

    const deptLower = deptName.toLowerCase();
    if (deptLower.includes("hr") || deptLower.includes("human")) {
      return "bg-blue-500/20 text-blue-400";
    } else if (deptLower.includes("tech") || deptLower.includes("it") || deptLower.includes("engineering")) {
      return "bg-purple-500/20 text-purple-400";
    } else if (deptLower.includes("finance") || deptLower.includes("accounting")) {
      return "bg-green-500/20 text-green-400";
    } else if (deptLower.includes("marketing") || deptLower.includes("sales")) {
      return "bg-amber-500/20 text-amber-400";
    } else {
      return "bg-teal-500/20 text-teal-400";
    }
  };

  return (
    <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} rounded-xl shadow-md p-6 flex flex-col gap-6 col-span-12`}>
      {/* Employees Table */}
      {employeesData && employeesData.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow-md">
          <table className="min-w-full bg-main rounded-xl shadow-lg border-separate border-spacing-0">
            <thead>
              <tr className={`${isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"} sticky top-0 z-10`}>
                <th className="text-start py-4 px-5 first:rounded-tl-xl uppercase font-semibold text-sm">{t("Employee")}</th>
                <th className="text-start py-4 px-5 uppercase font-semibold text-sm">{t("Contact")}</th>
                <th className="text-start py-4 px-5 uppercase font-semibold text-sm">{t("Department")}</th>
                <th className="text-start py-4 px-5 uppercase font-semibold text-sm">{t("Employment")}</th>
                <th className="text-end py-4 px-5 last:rounded-tr-xl uppercase font-semibold text-sm">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`${isLightMode
                      ? "hover:bg-gray-100 text-gray-800"
                      : "hover:bg-dark text-twhite"
                      } transition-all duration-200`}
                  >
                    {/* Employee Info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Briefcase className="w-3 h-3" />
                            {employee.job.title}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[200px]">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{employee.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(employee.department?.name)}`}>
                          <Building2 className="w-3 h-3" />
                          {employee.department?.name || t("No Department")}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{employee.address || t("No Address")}</span>
                        </div>
                      </div>
                    </td>

                    {/* Employment Info */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {employee.employment_date
                              ? new Date(employee.employment_date).toLocaleDateString()
                              : t("N/A")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{t("Base Salary")}: {employee.base_salary || 0}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex justify-end gap-2">
                        {/* Files Button */}
                        <FilesButton
                          employee={employee}
                          isLightMode={isLightMode}
                        />

                        {/* Edit Button */}
                        {(isAdmin || hasEditPermission) && (
                          <NavigateButton
                            data={employee}
                            className="cursor-pointer p-2 w-10 h-10 flex justify-center items-center rounded-lg bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 transition-colors shadow-sm hover:shadow-md"
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 px-5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-400 text-lg font-medium">
                        {getGlobalSearchTerm()
                          ? t("No employees found matching your search criteria")
                          : t("No employees found")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-400 text-xl font-medium mb-2">{t("No Employees Found")}</p>
          <p className="text-gray-500 text-center max-w-md">
            {t("There are no employees in the system. Add employees to see them listed here.")}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredEmployees.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2">
          {/* Items per page selector */}
          <div className="mb-4 md:mb-0 bg-secondary py-2 px-4 rounded-lg shadow-sm">
            <span className={`${isLightMode ? "text-gray-700" : "text-gray-300"}`}>{t("Showing")} </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
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
            <span className={`${isLightMode ? "text-gray-700" : "text-gray-300"}`}>
              {t("of")} {filteredEmployees.length} {t("items")}
            </span>
          </div>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center bg-secondary py-1 px-2 rounded-lg shadow-sm">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                    : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                  }`}
              >
                «
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${currentPage === 1
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
                  onClick={() => setCurrentPage(page)}
                  className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${currentPage === page
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
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                    : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                  }`}
              >
                ›
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 ${currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300 hover:shadow"
                    : "bg-dark hover:bg-gray-800 text-white border border-gray-700 hover:shadow"
                  }`}
              >
                »
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeesContent;