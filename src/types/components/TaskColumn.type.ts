import { SectionType } from "../Section.type";
import { ReceiveTaskType } from "../Task.type";

export interface TaskColumnProps {
  columnId: string;
  title: string;
  taskCount: number;
  tasks: ReceiveTaskType[];
  section?: SectionType; // SectionType, but keep as any for now for compatibility
}
