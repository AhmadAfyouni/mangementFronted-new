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
  useRolePermissions
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import { ProjectType } from "@/types/Project.type";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { Building2, ChevronDown, FolderOpen, Plus, Users } from "lucide-react";
import React, { useMemo, useState } from "react";


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
}> = ({ options, value, onChange, placeholder, icon, className = "" }) => {
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
        {/* Placeholder option */}
        {(!value || value === "") && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
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
  const [mainView, setMainView] = useState("all-tasks");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedProj, setSelectedProj] = useState("");
  const [isTasksByMe, setIsTasksByMe] = useState(false); // true = My Tasks, false = For Me Tasks

  console.log("🔍 TASKS VIEW DEBUGGING - isTasksByMe state:", isTasksByMe);

  const { t } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const { selector: userInfo } = useRedux((state) => state.user.userInfo);

  const { data: tasksData, isLoading: isTasksLoading } = useCustomQuery<{
    status: boolean;
    message: string;
    data: ReceiveTaskType[];
  }>({
    queryKey: ["tasks", "get-all"],
    url: `/tasks/get-all-tasks`,
    nestedData: true,
  });

  console.log("🔍 TASKS PAGE DEBUGGING - Raw tasksData:", tasksData);

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

  // Filter sections based on type_section (FOR_ME vs BY_ME)
  const filteredSections = useMemo(() => {
    console.log("🔍 TASKS PAGE DEBUGGING - sections:", sections);
    console.log("🔍 TASKS PAGE DEBUGGING - isTasksByMe:", isTasksByMe);

    if (!sections) return [];

    const filtered = sections.filter(section => {
      console.log(`🔍 TASKS PAGE DEBUGGING - Section ${section.name}: type_section = ${section.type_section}`);
      if (isTasksByMe) {
        // "Tasks By Me" - show sections with type_section "BY_ME"
        const shouldInclude = section.type_section === "BY_ME";
        console.log(`🔍 TASKS PAGE DEBUGGING - Section ${section.name}: isTasksByMe=${isTasksByMe}, shouldInclude=${shouldInclude}`);
        return shouldInclude;
      } else {
        // "Tasks For Me" - show sections with type_section "FOR_ME"
        const shouldInclude = section.type_section === "FOR_ME";
        console.log(`🔍 TASKS PAGE DEBUGGING - Section ${section.name}: isTasksByMe=${isTasksByMe}, shouldInclude=${shouldInclude}`);
        return shouldInclude;
      }
    });

    console.log("🔍 TASKS PAGE DEBUGGING - filteredSections:", filtered);
    return filtered;
  }, [sections, isTasksByMe]);

  // Frontend filtering logic for tasks
  const filteredTasksData = useMemo(() => {
    console.log("🔍 DEBUGGING - tasksData:", tasksData);
    console.log("🔍 DEBUGGING - tasksData?.data:", tasksData?.data);
    console.log("🔍 DEBUGGING - tasksData?.data?.length:", tasksData?.data?.length);

    // Handle both nested data structure and direct array
    const tasksArray = tasksData?.data || tasksData;

    if (!tasksArray || !Array.isArray(tasksArray)) {
      console.log("🔍 DEBUGGING - No valid tasks array, returning empty array");
      return [];
    }

    console.log("🔍 DEBUGGING - Using tasksArray:", tasksArray);
    console.log("🔍 DEBUGGING - tasksArray length:", tasksArray.length);

    let filtered = tasksArray;

    // Filter by main view type
    if (mainView === "all-tasks" || mainView === "my-tasks") {
      console.log("🔍 DEBUGGING - Filtering tasks by assignee. isTasksByMe:", isTasksByMe);
      console.log("🔍 DEBUGGING - Current user ID:", userInfo?.id);

      // Filter tasks based on assignee relationship to current user
      filtered = filtered.filter((task) => {
        console.log(`🔍 DEBUGGING - Processing task: ${task.name}`);
        console.log(`🔍 DEBUGGING - Task assignee:`, task.assignee);
        console.log(`🔍 DEBUGGING - Task assignee ID:`, task.assignee?.id);
        console.log(`🔍 DEBUGGING - Current user ID:`, userInfo?.id);

        // Check if task has an assignee
        if (!task.assignee) {
          console.log(`🔍 DEBUGGING - Task ${task.name} has no assignee, excluding`);
          return false;
        }

        if (isTasksByMe) {
          // "Tasks By Me" - I am the assignee (I created/assigned this task to myself)
          const isAssignedToMe = task.assignee.id === userInfo?.id;
          console.log(`🔍 DEBUGGING - Task ${task.name} isAssignedToMe: ${isAssignedToMe}`);
          return isAssignedToMe;
        } else {
          // "Tasks For Me" - I am NOT the assignee (assigned to someone else)
          const isAssignedToSomeoneElse = task.assignee.id !== userInfo?.id;
          console.log(`🔍 DEBUGGING - Task ${task.name} isAssignedToSomeoneElse: ${isAssignedToSomeoneElse}`);
          return isAssignedToSomeoneElse;
        }
      });
    } else if (mainView === "department-tasks") {
      // For department tasks, show all tasks in the selected department
      // No section type filtering, only department filtering
      console.log("🔍 DEBUGGING - Department tasks view - no assignee filtering applied");
    } else if (mainView === "project-tasks") {
      // For project tasks, show all tasks in the selected project
      // No section type filtering, only project filtering
      console.log("🔍 DEBUGGING - Project tasks view - no assignee filtering applied");
    }

    // Filter by project if selected
    if (selectedProj) {
      console.log("🔍 DEBUGGING - Filtering by project:", selectedProj);
      filtered = filtered.filter(task => {
        const matches = task.project?._id === selectedProj;
        console.log(`🔍 DEBUGGING - Task ${task.name} project match: ${matches} (task.project._id: ${task.project?._id}, selectedProj: ${selectedProj})`);
        return matches;
      });
    }

    // Filter by department if selected
    if (selectedDept) {
      console.log("🔍 DEBUGGING - Filtering by department:", selectedDept);
      // Find the department name from the selected ID
      const selectedDeptName = deptTree?.tree?.find(dept => dept.id === selectedDept)?.name;
      console.log("🔍 DEBUGGING - Selected department name:", selectedDeptName);

      filtered = filtered.filter(task => {
        const matches = task.department?.name === selectedDeptName;
        console.log(`🔍 DEBUGGING - Task ${task.name} department match: ${matches} (task.department.name: ${task.department?.name}, selectedDeptName: ${selectedDeptName})`);
        return matches;
      });
    }

    console.log("🔍 DEBUGGING - Final filtered tasks length:", filtered.length);
    return filtered;
  }, [tasksData, mainView, isTasksByMe, selectedProj, selectedDept, userInfo?.id]);

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
    { value: "all-tasks", label: t("All Tasks") },
    // { value: "my-tasks", label: t("My Tasks") },
    { value: "department-tasks", label: t("Department Tasks") },
    { value: "project-tasks", label: t("Project Tasks") },
  ];

  // Filtered Department Options for Project Tasks
  const filteredDepartmentOptions = mainView === "project-tasks" && selectedProj
    ? (deptTree?.tree || []).map(dept => ({ value: dept.id, label: dept.name }))
    : departmentOptions;

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

        <div className="flex justify-center   items-center gap-4 flex-wrap">


          {/* Conditional Rendering */}
          {mainView === "all-tasks" && (
            <TaskToggle
              isTasksByMe={isTasksByMe}
              onToggle={(value) => {
                console.log("🔍 TASKS VIEW DEBUGGING - Toggle changed from", isTasksByMe, "to", value);
                setIsTasksByMe(value);
              }}
              t={t}
            />
          )}

          {mainView === "my-tasks" && (
            <TaskToggle
              isTasksByMe={isTasksByMe}
              onToggle={(value) => {
                console.log("🔍 TASKS VIEW DEBUGGING - Toggle changed from", isTasksByMe, "to", value);
                setIsTasksByMe(value);
              }}
              t={t}
            />
          )}

          {mainView === "project-tasks" && (
            <>

              <EnhancedSelect
                options={filteredDepartmentOptions}
                value={selectedDept}
                onChange={setSelectedDept}
                placeholder={t("Select Department")}
                icon={<Building2 className="h-4 w-4" />}
                className="min-w-[200px]"
              />
              <EnhancedSelect
                options={projectOptions}
                value={selectedProj}
                onChange={setSelectedProj}
                placeholder={t("Select Project")}
                icon={<FolderOpen className="h-4 w-4" />}
                className="min-w-[200px]"
              />
            </>
          )}


          {mainView === "department-tasks" && (
            <EnhancedSelect
              options={departmentOptions}
              value={selectedDept}
              onChange={setSelectedDept}
              placeholder={t("Select Department")}
              icon={<Building2 className="h-4 w-4" />}
              className="min-w-[200px]"
            />
          )}

          {/* Main Menu */}
          <EnhancedSelect
            options={mainSelectOptions}
            value={mainView}
            onChange={(value) => {
              setMainView(value);
              setSelectedDept("");
              setSelectedProj("");
            }}
            placeholder={t("Select View")}
            icon={<Users className="h-4 w-4" />}
            className="min-w-[180px]"
          />

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

        {activeTab === "list" && filteredTasksData && (
          <TaskList tasksData={filteredTasksData} sections={filteredSections} isTasksByMe={isTasksByMe} />
        )}

        {activeTab === "board" && filteredTasksData && (
          <GridContainer extraStyle=" !pl-0 ">
            <TasksContent tasksData={filteredTasksData} sections={filteredSections} isTasksByMe={isTasksByMe} />
          </GridContainer>
        )}

        {activeTab === "tree" && tasksData && (
          <TaskHierarchyTree data={[]} width="100%" />
        )}
      </div>
    </GridContainer>
  );
};

export default TasksView;