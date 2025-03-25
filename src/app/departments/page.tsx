"use client";

import { TableIcon, TreeIcon } from "@/assets";
import TasksTab from "@/components/common/atoms/tasks/TasksTab";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import DepartmentsContent from "@/components/common/molcules/DepartmentsContent";
import DepartmentHierarchyTree from "@/components/common/molcules/DepartmentsHierarchyTree";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import { DepartmentType } from "@/types/DepartmentType.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const DepartmentsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("table");

  const [selectedOption, setSelectedOption] = useState("get-departments");
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

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row justify-between items-center mb-5 gap-5">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5">
            <PageSpinner />
          </div>
        )}
        <h1 className="text-3xl font-bold text-twhite text-center">
          {t("Departments")}
        </h1>
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {showSelect && (
            <select
              className=" border bg-secondary outline-none border-none text-twhite border-gray-300 rounded-lg px-4 py-2 focus:outline-none transition duration-200"
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
              <div className="bg-secondary text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200">
                {t("Add Department")}
              </div>
            </RouteWrapper>
          )}
        </div>
      </div>
      <div className="col-span-full">
        <TasksTab
          tabs={[
            { id: "table", label: "Table", icon: TableIcon },
            { id: "tree", label: "Tree", icon: TreeIcon },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab == "table" && departments && departments.info && (
          <DepartmentsContent departmentsData={departments.info} />
        )}
        {activeTab == "tree" && (
          <>
            {departments && departments.tree && (
              <DepartmentHierarchyTree data={departments.tree} width="100%" />
            )}
          </>
        )}
      </div>
    </GridContainer>
  );
};

export default DepartmentsView;
