import { ReceiveTaskType } from "../Task.type";

export type DeptTree = {
  id: string;
  name: string;
  parentId: string | null;
  tasks: ReceiveTaskType[];
};
