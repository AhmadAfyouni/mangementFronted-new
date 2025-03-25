import { ReceiveTaskType } from "../Task.type";

export interface Comment {
  id: string;
  content: string;
  files: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}
export interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: ReceiveTaskType | null;
}
