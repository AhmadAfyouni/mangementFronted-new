import { DeptTree } from "@/types/trees/Department.tree.type";

export const getDeptNameById = (id: string, departments: DeptTree[]) => {
  return departments?.find((department) => department.id == id)?.name || id;
};
