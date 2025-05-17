"use client";

import { TableIcon, TreeIcon } from "@/assets";
import EmployeesHierarchyTree from "@/components/common/atoms/EmployeesHierarchyTree";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import EmployeesContent from "@/components/common/molcules/EmployeesContent";
import {
  useRolePermissions
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import { EmployeeType } from "@/types/EmployeeType.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { Plus, TreeDeciduous, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const Page = () => {
  const [activeTab, setActiveTab] = useState<string>("table");
  const { isLightMode } = useCustomTheme();

  const isAdmin = useRolePermissions("admin");
  const { t } = useTranslation();

  const { data: employees, isLoading } = useCustomQuery<{
    info: EmployeeType[];
    tree: EmpTree[];
  }>({
    queryKey: ["employees"],
    url: `/emp/tree`,
  });

  return (
    <GridContainer>
      {/* Header Section */}
      <div className={`col-span-full ${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} p-6 rounded-xl shadow-lg mb-6`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-twhite">
                {t("Employees Management")}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {employees ? t("Managing {{count}} employees", { count: employees.info.length }) : t("Loading employees...")}
              </p>
            </div>
          </div>

          {/* Add Employee Button */}
          {isAdmin && (
            <RouteWrapper href="/employees/add-employee">
              <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors shadow hover:shadow-md ${isLightMode
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                <Plus className="w-4 h-4" />
                {t("Add Employee")}
              </button>
            </RouteWrapper>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="col-span-full mb-4">
        <div className={`bg-secondary p-2 rounded-lg inline-flex shadow-md`}>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'table'
              ? isLightMode
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
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
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
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
              <p className="text-gray-400">{t("Loading employees data...")}</p>
            </div>
          </div>
        ) : !employees || employees.info.length === 0 ? (
          <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} rounded-xl shadow-md p-16 flex flex-col items-center justify-center`}>
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-twhite mb-2">{t("No Employees Found")}</h2>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {t("There are no employees in the system yet. Add employees to get started with employee management.")}
            </p>
            {isAdmin && (
              <RouteWrapper href="/employees/add-employee">
                <button className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow hover:shadow-md transition-colors ${isLightMode
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  <Plus className="w-5 h-5" />
                  {t("Add First Employee")}
                </button>
              </RouteWrapper>
            )}
          </div>
        ) : (
          <>
            {activeTab === "table" && (
              <EmployeesContent employeesData={employees.info} />
            )}
            {activeTab === "tree" && employees && (
              <div className={`${isLightMode ? 'bg-light-droppable-fade' : 'bg-droppable-fade'} p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <TreeDeciduous className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-twhite">{t("Organization Chart")}</h2>
                </div>
                <div className="bg-main rounded-xl overflow-hidden shadow-inner">
                  <EmployeesHierarchyTree data={employees.tree} width="100%" lightMode={isLightMode} />
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