"use client";
import { TabBoardIcon, TabListIcon, TreeIcon } from "@/assets";
import TaskHierarchyTree from "@/components/common/atoms/tasks/TasksHierarchyTree";
import TasksTab from "@/components/common/atoms/tasks/TasksTab";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import TaskList from "@/components/common/organisms/TaskList";
import TasksContent from "@/components/common/organisms/TasksContent";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { ProjectType } from "@/types/Project.type";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { TaskTree } from "@/types/trees/Task.tree.type";
import { Building2, ChevronDown, FolderOpen, Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

// Enhanced Toggle Component
const TaskToggle: React.FC<{
  isTasksByMe: boolean;
  onToggle: (isTasksByMe: boolean) => void;
  t: (key: string) => string;
}> = ({ isTasksByMe, onToggle, t }) => {
  return (
    <div className="relative flex gap-2 items-center bg-secondary rounded-xl p-1 shadow-lg border border-gray-600/30 hover:border-blue-500/40 transition-all duration-300">


      {/* Tasks By Me Button */}
      <button
        onClick={() => onToggle(true)}
        className={`relative shadow-sm z-10 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 min-w-[100px] ${isTasksByMe
          ? 'text-blue-400 bg-blue-500/30 '
          : 'text-gray-400 hover:text-twhite'
          }`}
      >
        {t("Tasks By Me")}
      </button>

      {/* Tasks For Me Button */}
      <button
        onClick={() => onToggle(false)}
        className={`relative shadow-sm z-10 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 min-w-[100px] ${!isTasksByMe
          ? 'text-blue-400 bg-blue-500/30'
          : 'text-gray-400 hover:text-twhite'
          }`}
      >
        {t("Tasks For Me")}
      </button>
    </div>
  );
};

// Enhanced Select Component
const EnhancedSelect: React.FC<{
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ options, value, onChange, icon, className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        {icon && <div className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200">{icon}</div>}
      </div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none w-full bg-secondary border border-gray-600/30 text-twhite rounded-xl 
          ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
          hover:border-blue-500/40 hover:bg-secondary/90
          transition-all duration-300 shadow-lg
          cursor-pointer
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-secondary text-twhite">
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
      </div>
    </div>
  );
};

// Enhanced Add Task Button
const AddTaskButton: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  return (
    <RouteWrapper href="/tasks/add-task">
      <div className="group relative overflow-hidden bg-secondary text-twhite px-6 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-600/30 hover:border-blue-500/40 hover:bg-blue-500/10">
        <div className="relative flex items-center gap-2">
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          {t("Add Task")}
        </div>
      </div>
    </RouteWrapper>
  );
};

const TasksView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [myProj, setMyProj] = useState(false);
  const [myDept, setMyDept] = useState(false);
  const [selectedProj, setSelectedProj] = useState<string | null>(null);
  const [isTasksByMe, setIsTasksByMe] = useState<boolean>(false);

  const { t } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const [selectedOption, setSelectedOption] = useState("");

  // Construct query with both existing options and new toggle
  const getQueryString = () => {
    const queryParts = [];

    // Add existing selectedOption if any
    if (selectedOption) {
      queryParts.push(selectedOption);
    }

    // Add toggle parameter
    if (isTasksByMe) {
      queryParts.push("tasks-by-me=true");
    }

    return queryParts.join("&");
  };

  const { data: tasksData, isLoading: isTasksLoading } = useCustomQuery<{
    info: ReceiveTaskType[];
    tree: TaskTree[];
  }>({
    queryKey: ["tasks", selectedOption, isTasksByMe + ""],
    url: `/tasks/tree?${getQueryString()}`,
  });

  const { data: projects } = useCustomQuery<ProjectType[]>({
    queryKey: ["projects"],
    url: `/projects/${isAdmin ? "get-all-projects" : "get-manager-project"}`,
  });

  const { data: deptTree } = useCustomQuery<{ tree: DeptTree[] }>({
    queryKey: ["deptTree", selectedProj ?? "three"],
    url: `/${selectedProj
      ? `projects/project-departments-tree/${selectedProj}`
      : "department/tree"
      }`,
  });

  const { data: sections, isLoading: isSectionsLoading } = useCustomQuery<
    SectionType[]
  >({
    queryKey: ["sections"],
    url: `/sections`
  });

  useEffect(() => {
    console.log("Selected Option:", selectedOption);
    console.log("Tasks By Me:", isTasksByMe);
    console.log("Query String:", getQueryString());
  }, [selectedOption, isTasksByMe]);

  const canViewTasks = usePermissions(["task_search_and_view"]);
  const showMainSelect = canViewTasks || isPrimary || isAdmin;

  const handleToggle = (tasksByMe: boolean) => {
    setIsTasksByMe(tasksByMe);
  };

  // Prepare dropdown options
  const departmentOptions = deptTree?.tree?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || [];

  const projectOptions = projects?.map(proj => ({
    value: proj._id,
    label: proj.name
  })) || [];

  const mainSelectOptions = [
    ...(canViewTasks ? [{ value: "", label: t("My Tasks") }] : []),
    ...(canViewTasks && (isPrimary || isAdmin) ? [{ value: "get-my-dept-tasks", label: t("Department Tasks") }] : []),
    ...(canViewTasks ? [{ value: "my-project-tasks", label: t("Project Tasks") }] : []),
  ];

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        {isSectionsLoading ? (
          <PageSpinner title={t("sections Loading ...")} />
        ) : (
          isTasksLoading && <PageSpinner title={t("Tasks Loading ...")} />
        )}

        <h1 className="text-4xl font-bold text-twhite text-center">
          {t("Tasks")}
        </h1>

        <div className="flex justify-center items-center gap-4 flex-wrap">
          {/* Task Toggle - Only show when "My Tasks" is selected */}
          {canViewTasks && selectedOption === "" && !myProj && !myDept && (
            <TaskToggle
              isTasksByMe={isTasksByMe}
              onToggle={handleToggle}
              t={t}
            />
          )}

          {/* Departments Dropdown */}
          {(myDept || myProj) && (
            <EnhancedSelect
              options={departmentOptions}
              onChange={(value) => {
                const deptOption = `departmentId=${value}`;
                const projOption = selectedProj ? `&projectId=${selectedProj}` : "";
                setSelectedOption(deptOption + projOption);
              }}
              placeholder={t("Select a department")}
              icon={<Building2 className="h-4 w-4" />}
              className="min-w-[200px]"
            />
          )}

          {/* Project Dropdown */}
          {myProj && (
            <EnhancedSelect
              options={projectOptions}
              value={selectedProj || ""}
              onChange={setSelectedProj}
              placeholder={t("Select a project")}
              icon={<FolderOpen className="h-4 w-4" />}
              className="min-w-[200px]"
            />
          )}

          {/* Main Dropdown */}
          {showMainSelect && (
            <EnhancedSelect
              options={mainSelectOptions}
              value={selectedOption}
              onChange={(value) => {
                setMyProj(value === "my-project-tasks");
                setMyDept(value === "get-my-dept-tasks");
                setSelectedOption(value); // Always update selectedOption
                setSelectedProj(null);
              }}
              placeholder={t("Select view")}
              icon={<Users className="h-4 w-4" />}
              className="min-w-[180px]"
            />
          )}

          {/* Add Task Button */}
          {(isAdmin || isPrimary) && <AddTaskButton t={t} />}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="col-span-full">
        <TasksTab
          tabs={[
            { id: "list", label: "List", icon: TabListIcon },
            { id: "board", label: "Board", icon: TabBoardIcon },
            { id: "tree", label: "Tree", icon: TreeIcon },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === "list" && tasksData?.info && (
          <TaskList tasksData={tasksData.info} sections={sections} />
        )}

        {activeTab === "board" && tasksData?.info && (
          <GridContainer extraStyle=" !pl-0 ">
            <TasksContent tasksData={tasksData.info} sections={sections} />
          </GridContainer>
        )}

        {activeTab === "tree" && tasksData && (
          <TaskHierarchyTree data={tasksData.tree} width="100%" />
        )}
      </div>
    </GridContainer>
  );
};

export default TasksView;