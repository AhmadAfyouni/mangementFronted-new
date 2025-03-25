"use client";

import InfoCard from "@/components/common/atoms/InfoCard";
import ProjectDetailsHierarchyTree from "@/components/common/atoms/ProjectDetailsHierarchyTree";
import TaskStatusPieChart from "@/components/common/atoms/tasks/TaskStatusPieChart";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import HomeTasksReport from "@/components/common/molcules/HomeTasksReport";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { formatDate } from "@/services/task.service";
import { ProjectDetailsType } from "@/types/Project.type";
import { useRouter } from "next/navigation";

const ProjectDetails = ({ params: { id } }: { params: { id: string } }) => {
  const { t, currentLanguage } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const router = useRouter();

  const { data: project, isLoading } = useCustomQuery<ProjectDetailsType>({
    queryKey: ["project-details"],
    url: `/projects/project-details/${id}`,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 text-twhite">
        {t("No Project Details")}
      </div>
    );
  }

  return (
    <GridContainer>
      <div className="col-span-full px-4 md:px-6">
        <h1
          className={`text-2xl md:text-3xl font-bold mb-6 ${
            isLightMode ? "text-twhite" : "text-twhite"
          }`}
        >
          {t("Project Details")}
        </h1>

        {project && (
          <>
            <InfoCard
              firstTitle=""
              firstDetails={[
                { label: "Name", value: project.name },
                { label: "Description", value: project.description },
                {
                  label: "Start Date",
                  value: formatDate(
                    project.startDate,
                    currentLanguage as "ar" | "en"
                  ),
                },
                {
                  label: "End Date",
                  value: formatDate(
                    project.endDate,
                    currentLanguage as "ar" | "en"
                  ),
                },
                { label: "Is Overdue", value: project.is_over_due.toString() },
              ]}
              customStyle="bg-secondary mb-6"
              fieldCustomStyle="bg-dark text-twhite"
            />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="w-full lg:w-[65%]">
                <HomeTasksReport
                  tasksData={project.projectTasks}
                  isCentered={false}
                />
              </div>
              <div className="w-full lg:w-64 h-64 mx-auto lg:mx-0">
                <TaskStatusPieChart
                  taskDone={project.taskDone}
                  taskOnGoing={project.taskOnGoing}
                  taskOnTest={project.taskOnTest}
                  taskPending={project.taskPending}
                />
              </div>
            </div>

            <div className="my-7 w-full lg:w-2/3 mx-auto overflow-x-auto">
              <ProjectDetailsHierarchyTree
                data={project.departments}
                width="100%"
                onPress={(deptId) => {
                  console.log(`Node clicked: ${deptId}`);
                  router.push(
                    `/projects/details/project-tasks/${project._id}/${deptId}`
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
    </GridContainer>
  );
};

export default ProjectDetails;
