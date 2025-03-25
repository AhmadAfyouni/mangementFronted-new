"use client";

import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import TaskListView from "@/components/common/organisms/TaskListView";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useEffect } from "react";

const ProjectTasks = ({ params: { id } }: { params: { id: string } }) => {
  const {
    mutate: getProjectTask,
    data: projectTask,
    isPending,
  } = useCreateMutation({
    endpoint: "/tasks/get-project-tasks-by-dept",
    onSuccessMessage: "project task fetched successfully!",
    invalidateQueryKeys: ["projectTasks"],
    onSuccessFn: () => {},
    requestType: "post",
  });

  useEffect(() => {
    getProjectTask({
      project_id: id[0],
      department_id: id[1],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {isPending ? <PageSpinner /> : <TaskListView tasksData={projectTask} />}
    </div>
  );
};

export default ProjectTasks;
