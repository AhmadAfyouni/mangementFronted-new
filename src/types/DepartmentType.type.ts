import { UseFormGetValues } from "react-hook-form";
import { DeptTree } from "./trees/Department.tree.type";

export interface DepartmentType {
  id: string;
  name: string;
  description: string;
  goal: string;
  category: string;
  mainTasks: string;
  parent_department?: string;
  numericOwners: { category: string; count: number }[];
  supportingFiles: string[];
  requiredReports: { name: string; templateFile: string }[];
  developmentPrograms: {
    programName: string;
    objective: string;
    notes?: string;
    programFile: string;
  }[];
}

export interface DepartmentFormInputs {
  id: string;
  name: string;
  description: string;
  goal: string;
  category: string;
  mainTasks: string;
  parent_department_id?: string;
  numericOwners: { category: string; count: number }[];
  supportingFiles: string[];
  requiredReports: { name: string; templateFile: string }[];
  developmentPrograms: {
    programName: string;
    objective: string;
    notes?: string;
    programFile: string;
  }[];
}

export interface CreateDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  departmentData?: DepartmentFormInputs | null;
}

export interface SnackbarConfig {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}
export interface HandleManualSubmitOptions {
  getValues: UseFormGetValues<DepartmentFormInputs>;
  addDepartment: (data: DepartmentFormInputs) => void;
}

export interface DepartmentsTotalType {
  info: DepartmentType[];
  tree: DeptTree[];
}
