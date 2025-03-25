import { ReceiveTaskType } from "../Task.type";

export interface TaskCardProps {
  taskId: string;
  index: number;
  title: string;
  commentsCount: number;
  attachmentsCount: number;
  priority: string;
  task: ReceiveTaskType;
}
