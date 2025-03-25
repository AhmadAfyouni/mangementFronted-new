export type EmpTree = {
  id: string;
  name: string;
  is_manager: boolean;
  title: string;
  parentId: string | null;
  department: string;
};
