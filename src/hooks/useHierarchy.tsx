import HomeListRow from "@/components/common/atoms/tasks/HomeListRow";
import ListRow from "@/components/common/atoms/tasks/ListRow";
import { ExtendedReceiveTaskType, ReceiveTaskType } from "@/types/Task.type";
import React from "react";

const useHierarchy = () => {
  const renderedTasks = new Set<string>(); // Track rendered task IDs

  function organizeTasksByHierarchy(
    tasks: ReceiveTaskType[]
  ): ExtendedReceiveTaskType[] {
    // Create a map to store tasks by their ID for quick access
    const taskMap = new Map<string, ExtendedReceiveTaskType>();

    // Add a `subTasks` array to each task
    tasks.forEach((task) => {
      taskMap.set(task.id, { ...task, subTasks: [] });
    });

    // Final array to store top-level tasks
    const rootTasks: ExtendedReceiveTaskType[] = [];

    // Iterate through the tasks to build the hierarchy
    tasks.forEach((task) => {
      if (task.parent_task) {
        // Find the parent and add the current task to its subTasks
        const parentTask = taskMap.get(task.parent_task);
        if (parentTask) {
          parentTask.subTasks!.push(taskMap.get(task.id)!);
        }
      } else {
        // If no parent_task, it's a root task
        rootTasks.push(taskMap.get(task.id)!);
      }
    });

    return rootTasks;
  }

  const renderTaskWithSubtasks = (
    task: ExtendedReceiveTaskType,
    level: number,
    sectionName?: string
  ) => {
    if (renderedTasks.has(task.id)) return null;
    renderedTasks.add(task.id);

    return (
      <React.Fragment key={task.id}>
        <ListRow task={task} level={level} sectionName={sectionName} />

        {task.subTasks &&
          task.subTasks.map((subTask) =>
            renderTaskWithSubtasks(subTask, level + 1, sectionName)
          )}
      </React.Fragment>
    );
  };
  const renderHomeTaskWithSubtasks = (
    task: ExtendedReceiveTaskType,
    level: number
  ) => {
    if (renderedTasks.has(task.id)) return null;
    renderedTasks.add(task.id);

    return (
      <React.Fragment key={task.id}>
        <HomeListRow task={task} level={level} />
        <div className="w-full h-2 bg-transparent"></div>

        {task.subTasks &&
          task.subTasks.map((subTask) =>
            renderHomeTaskWithSubtasks(subTask, level + 1)
          )}
      </React.Fragment>
    );
  };
  return {
    organizeTasksByHierarchy,
    renderTaskWithSubtasks,
    renderHomeTaskWithSubtasks,
  };
};

export default useHierarchy;
