import { ReceiveTaskType } from "../Task.type";

export interface TaskColumnProps {
  columnId: string;
  title: string;
  taskCount: number;
  tasks: ReceiveTaskType[];
}
