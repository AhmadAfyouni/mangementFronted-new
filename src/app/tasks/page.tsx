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
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import { ProjectType } from "@/types/Project.type";
import { SectionType } from "@/types/Section.type";
import { ReceiveTaskType } from "@/types/Task.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { TaskTree } from "@/types/trees/Task.tree.type";
import React, { useEffect, useState } from "react";

const TasksView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [myProj, setMyProj] = useState(false);
  const [myDept, setMyDept] = useState(false);
  const [selectedProj, setSelectedProj] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const { t } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const [selectedOption, setSelectedOption] = useState(
    // isPrimary ? "get-my-dept-tasks" :
    ""
  );
  const { data: tasksData, isLoading: isTasksLoading } = useCustomQuery<{
    info: ReceiveTaskType[];
    tree: TaskTree[];
  }>({
    queryKey: ["tasks", selectedOption],
    url: `/tasks/tree?${selectedOption}`,
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

  const { selector } = useRedux(
    (state: RootState) => state.user.userInfo?.department.id
  );

  const { data: sections, isLoading: isSectionsLoading } = useCustomQuery<
    SectionType[]
  >({
    queryKey: ["sections"],
    url: `/sections`
  });

  useEffect(() => {
    console.log(selectedOption);
  }, [selectedOption]);

  const canViewTasks = usePermissions(["task_search_and_view"]);

  const showMainSelect = canViewTasks || isPrimary || isAdmin;

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row  justify-between items-center gap-5">
        {isSectionsLoading ? (
          <PageSpinner title={t("sections Loading ...")} />
        ) : (
          isTasksLoading && <PageSpinner title={t("Tasks Loading ...")} />
        )}
        <h1 className="text-3xl font-bold text-twhite text-center">
          {t("Tasks")}
        </h1>
        <div className="flex justify-center items-center gap-5 flex-wrap mb-5">
          {/* Departments Dropdown */}
          {(myDept || myProj) && (
            <select
              className="bg-secondary outline-none border-none text-twhite rounded-lg px-4 py-2 focus:outline-none transition duration-200"
              onChange={(e) => {
                const value = e.target.value;

                setSelectedDept(value);
                const deptOption = `departmentId=${value}`;
                const projOption = selectedProj
                  ? `&projectId=${selectedProj}`
                  : "";
                setSelectedOption(deptOption + projOption);
              }}
            >
              <option value="">{t("Select a department")}</option>
              {deptTree &&
                deptTree.tree &&
                deptTree.tree.map((dTree) => (
                  <option key={dTree.id} value={dTree.id}>
                    {dTree.name}
                  </option>
                ))}
            </select>
          )}

          {/* Project-Specific Dropdown */}
          {myProj && (
            <select
              className="bg-secondary outline-none border-none text-twhite rounded-lg px-4 py-2 focus:outline-none transition duration-200"
              onChange={(e) => setSelectedProj(e.target.value)}
            >
              <option value="">{t("Select a project")}</option>
              {projects &&
                projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
            </select>
          )}

          {/* Main Dropdown */}
          {showMainSelect && (
            <select
              className="bg-secondary outline-none border-none text-twhite rounded-lg px-4 py-2 focus:outline-none transition duration-200"
              defaultValue={selectedOption}
              onChange={(e) => {
                const value = e.target.value;
                setMyProj(value === "my-project-tasks");
                setMyDept(value === "get-my-dept-tasks");
                if (
                  value !== "my-project-tasks" &&
                  value !== "get-my-dept-tasks"
                ) {
                  setSelectedOption(value);
                }
                setSelectedProj(null);
                setSelectedDept(null);
              }}
            >
              {canViewTasks && <option value="">{t("My Tasks")}</option>}
              {canViewTasks && (isPrimary || isAdmin) && (
                <option value="get-my-dept-tasks">
                  {t("Department Tasks")}
                </option>
              )}
              {canViewTasks && (
                <option value="my-project-tasks">{t("Project Tasks")}</option>
              )}
            </select>
          )}

          {/* Add Task Button */}
          {(isAdmin || isPrimary) && (
            <RouteWrapper href="/tasks/add-task">
              <div className="bg-secondary text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200">
                {t("Add Task")}
              </div>
            </RouteWrapper>
          )}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="col-span-full   ">
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