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
import { Building2, Briefcase, Users, Mail, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, DollarSign } from "lucide-react";
import React, { useState } from "react";

interface EmployeesContentProps {
  employeesData: EmployeeType[];
}

const EmployeeRowComponent: React.FC<{
  employee: EmployeeType;
  isAdmin: boolean;
  hasEditPermission: boolean;
  NavigateButton: any;
  t: (key: string) => string;
}> = ({ employee, isAdmin, hasEditPermission, NavigateButton, t }) => {

  const getPriorityBorderColor = (department?: string) => {
    if (!department) return 'border-l-gray-400';

    const deptLower = department.toLowerCase();
    if (deptLower.includes("hr") || deptLower.includes("human")) {
      return 'border-l-blue-500';
    } else if (deptLower.includes("tech") || deptLower.includes("it") || deptLower.includes("engineering")) {
      return 'border-l-purple-500';
    } else if (deptLower.includes("finance") || deptLower.includes("accounting")) {
      return 'border-l-green-500';
    } else if (deptLower.includes("marketing") || deptLower.includes("sales")) {
      return 'border-l-amber-500';
    } else {
      return 'border-l-teal-500';
    }
  };

  const getDepartmentBadgeColor = (deptName?: string) => {
    if (!deptName) return "bg-gray-500/20 text-gray-400 border-gray-500/30";

    const deptLower = deptName.toLowerCase();
    if (deptLower.includes("hr") || deptLower.includes("human")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else if (deptLower.includes("tech") || deptLower.includes("it") || deptLower.includes("engineering")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (deptLower.includes("finance") || deptLower.includes("accounting")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (deptLower.includes("marketing") || deptLower.includes("sales")) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else {
      return "bg-teal-500/20 text-teal-400 border-teal-500/30";
    }
  };

  return (
    <div
      className={`grid grid-cols-11 gap-6 px-8 py-4 group border-l-4 ${getPriorityBorderColor(employee.department?.name)} hover:bg-secondary/50 transition-all duration-300 bg-dark border-b border-1 border-main`}
    >
      {/* Employee ID */}
      <div className="flex items-center col-span-1">
        <div className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300 truncate">
          {employee.id.slice(-5).toUpperCase()}
        </div>
      </div>


      {/* Employee Info */}
      <div className="flex items-center px-4 col-span-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300 truncate">
              {employee.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{employee.job.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col justify-center px-4 col-span-2">
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-1.5">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.phone}</span>
        </div>
      </div>

      {/* Department & Location */}
      <div className="flex flex-col justify-center px-4 col-span-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-2 w-fit ${getDepartmentBadgeColor(employee.department?.name)}`}>
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{employee.department?.name || t("No Department")}</span>
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{employee.address || t("No Address")}</span>
        </div>
      </div>

      {/* Employment Details */}
      <div className="flex flex-col justify-center px-4 col-span-2">
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-1.5">
          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="truncate">
            {employee.employment_date
              ? new Date(employee.employment_date).toLocaleDateString()
              : t("N/A")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="truncate">${employee.base_salary || 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pl-4 col-span-2">
        {/* Files Button */}
        <FilesButton
          employee={employee}
          isLightMode={false}
        />

        {/* Edit Button */}
        {(isAdmin || hasEditPermission) && (
          <NavigateButton
            data={employee}
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

  // Pagination calculations
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-xl shadow-md flex flex-col gap-4 col-span-12">
      {/* Employees Table */}
      <div className="overflow-hidden rounded-lg shadow-lg shadow-black/20 border border-gray-700/50">
        {!employeesData || employeesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">{t("No Employees Found")}</h3>
            <p className="text-tdark">{t("There are no employees in the system. Add employees to see them listed here.")}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">{t("No Results Found")}</h3>
            <p className="text-tdark">{t("No employees found matching your search criteria")}</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-secondary/50 border-b border-gray-700">
              <div className="grid grid-cols-6 gap-6 px-8 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <User className="w-4 h-4 text-blue-400" />
                  {t("ID")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <User className="w-4 h-4 text-blue-400" />
                  {t("Employee")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {t("Contact")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Building2 className="w-4 h-4 text-green-400" />
                  {t("Department")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {t("Employment")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <Briefcase className="w-4 h-4 text-yellow-400" />
                  {t("Actions")}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {currentEmployees.map((employee) => (
                <EmployeeRowComponent
                  key={employee.id}
                  employee={employee}
                  isAdmin={isAdmin}
                  hasEditPermission={hasEditPermission}
                  NavigateButton={NavigateButton}
                  t={t}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
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
    </div>
  );
};

export default EmployeesContent;