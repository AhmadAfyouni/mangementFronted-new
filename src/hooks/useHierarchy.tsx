import HomeListRow from "@/components/common/atoms/tasks/HomeListRow";
import ListRow from "@/components/common/atoms/tasks/ListRow";
import { ExtendedReceiveTaskType, ReceiveTaskType } from "@/types/Task.type";
import React from "react";

// Define minimum required employee type for conversion
type MinimalEmployee = {
  _id: string;
  name: string;
  [key: string]: unknown;
};

// Define minimum required section type for conversion
type MinimalSection = {
  _id: string;
  name: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const useHierarchy = () => {
  const renderedTasks = new Set<string>(); // Track rendered task IDs

  // Helper function to convert ReceiveTaskType to ExtendedReceiveTaskType
  const taskToExtendedTask = (task: ReceiveTaskType): ExtendedReceiveTaskType => {
    // Create minimal employee default
    const emptyEmployee: MinimalEmployee = { _id: '', name: 'Unassigned' };

    // Create minimal section default
    const emptySection: MinimalSection = {
      _id: '',
      name: 'Unsectioned',
      department: '',
      createdAt: '',
      updatedAt: '',
      __v: 0
    };

    return {
      ...task,
      // Use specific type assertions instead of any
      emp: (task.emp || emptyEmployee) as ExtendedReceiveTaskType['emp'],
      assignee: (task.assignee || emptyEmployee) as ExtendedReceiveTaskType['assignee'],
      section: (task.section || emptySection) as MinimalSection,
      startTime: task.startTime || '',
      subTasks: [] // Initialize with empty array
    } as ExtendedReceiveTaskType;
  };

  function organizeTasksByHierarchy(
    tasks: ReceiveTaskType[]
  ): ExtendedReceiveTaskType[] {
    // Create a map to store tasks by their ID for quick access
    const taskMap = new Map<string, ExtendedReceiveTaskType>();

    // Convert and add each task to the map
    tasks.forEach((task) => {
      taskMap.set(task.id, taskToExtendedTask(task));
    });

    // Final array to store top-level tasks
    const rootTasks: ExtendedReceiveTaskType[] = [];

    // Iterate through the tasks to build the hierarchy
    tasks.forEach((task) => {
      if (task.parent_task) {
        // Find the parent and add the current task to its subTasks
        const parentTask = taskMap.get(task.parent_task);
        if (parentTask) {
          parentTask.subTasks.push(taskMap.get(task.id)!);
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
