import { EmpTree } from "./Emp.tree.type";

export type DeptTree = {
  id: string;
  name: string;
  parentId: string | null;
  emps: EmpTree[];
};
