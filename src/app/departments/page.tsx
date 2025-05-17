"use client";

import { TableIcon, TreeIcon } from "@/assets";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import DepartmentsContent from "@/components/common/molcules/DepartmentsContent";
import DepartmentHierarchyTree from "@/components/common/molcules/DepartmentsHierarchyTree";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import { setActiveEntity } from "@/state/slices/searchSlice";
import { DepartmentType } from "@/types/DepartmentType.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Building2, Plus, TreeDeciduous } from "lucide-react";
import Image from "next/image";

const Page = () => {
  const [activeTab, setActiveTab] = useState<string>("table");
  const [selectedOption, setSelectedOption] = useState("");
  const { isLightMode } = useCustomTheme();

  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const { t } = useTranslation();
  const canViewSpecificDepartments = usePermissions([
    "department_view_specific",
  ]);

  const { data: departments, isLoading } = useCustomQuery<{
    info: DepartmentType[];
    tree: DeptTree[];
  }>({
    queryKey: ["departments"],
    url: `/department/tree`,
  });

  const showSelect = isAdmin || (canViewSpecificDepartments && isPrimary);
  const dispatch = useDispatch();

  // Set active entity for global search
  useEffect(() => {
    dispatch(setActiveEntity('departments'));
  }, [dispatch]);

  // Search configuration - fixed with proper typing
  const searchConfig: SearchConfig<DepartmentType> = {
    searchFields: ['name', 'category', 'goal', 'description', 'mainTasks'] as Array<keyof DepartmentType>,
    filterOptions: {
      category: {
        label: 'Category',
        options: [
          { value: 'Administration', label: 'Administration' },
          { value: 'Technical', label: 'Technical' },
          { value: 'Business', label: 'Business' }
        ]
      }
    }
  };

  // Use the global search hook to filter departments
  const {
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
  } = useGlobalSearch('departments', departments?.info || [], searchConfig);

  return (
    <GridContainer>
      {/* Header Section */}
      <div className={`col-span-full ${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} p-6 rounded-xl shadow-lg mb-6`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isLightMode ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-twhite">
                {t("Departments Management")}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {departments ? t("Managing {{count}} departments", { count: departments.info ? departments.info.length : 0 }) : t("Loading departments...")}
              </p>
            </div>
          </div>

          {/* Department Filters and Add Button */}
          <div className="flex items-center gap-3">
            {showSelect && (
              <select
                className={`border outline-none rounded-lg px-4 py-2.5 focus:outline-none transition-colors shadow ${isLightMode
                  ? 'bg-white text-gray-800 border-gray-200'
                  : 'bg-gray-800 text-white border-gray-700'
                  }`}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {isAdmin && (
                  <option value="get-departments">{t("All Departments")}</option>
                )}
                {canViewSpecificDepartments && isPrimary && (
                  <option value="view">{t("Accessible Departments")}</option>
                )}
              </select>
            )}

            {isAdmin && (
              <RouteWrapper href="/departments/add-department">
                <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors shadow hover:shadow-md ${isLightMode
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}>
                  <Plus className="w-4 h-4" />
                  {t("Add Department")}
                </button>
              </RouteWrapper>
            )}
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="col-span-full mb-4">
        <div className={`bg-secondary p-2 rounded-lg inline-flex shadow-md`}>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'table'
              ? isLightMode
                ? 'bg-purple-500 text-white'
                : 'bg-purple-600 text-white'
              : isLightMode
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
            onClick={() => setActiveTab('table')}
          >
            <Image src={TableIcon.src} alt="Table" width={20} height={20} />
            <span>{t("Table View")}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'tree'
              ? isLightMode
                ? 'bg-purple-500 text-white'
                : 'bg-purple-600 text-white'
              : isLightMode
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
            onClick={() => setActiveTab('tree')}
          >
            <Image src={TreeIcon.src} alt="Tree" width={20} height={20} />
            <span>{t("Tree")}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="col-span-full">
        {isLoading ? (
          <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} rounded-xl shadow-md p-8 flex items-center justify-center`}>
            <div className="flex flex-col items-center justify-center gap-4">
              <PageSpinner />
              <p className="text-gray-400">{t("Loading departments data...")}</p>
            </div>
          </div>
        ) : !departments || departments.info.length === 0 ? (
          <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} rounded-xl shadow-md p-16 flex flex-col items-center justify-center`}>
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-twhite mb-2">{t("No Departments Found")}</h2>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {t("There are no departments in the system yet. Add departments to get started with department management.")}
            </p>
            {isAdmin && (
              <RouteWrapper href="/departments/add-department">
                <button className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow hover:shadow-md transition-colors ${isLightMode
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}>
                  <Plus className="w-5 h-5" />
                  {t("Add First Department")}
                </button>
              </RouteWrapper>
            )}
          </div>
        ) : (
          <>
            {activeTab === "table" && (
              <DepartmentsContent
                departmentsData={paginatedData}
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems,
                  itemsPerPage,
                  onPageChange: handlePageChange,
                  onItemsPerPageChange: handleItemsPerPageChange
                }}
              />
            )}
            {activeTab === "tree" && departments && (
              <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <TreeDeciduous className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-twhite">{t("Organization Chart")}</h2>
                </div>
                <div className="bg-main rounded-xl overflow-hidden shadow-inner">
                  <DepartmentHierarchyTree
                    data={departments.tree}
                    width="100%"
                    lightMode={isLightMode}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GridContainer>
  );
};

export default Page;