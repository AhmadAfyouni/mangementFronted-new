import { UseFormGetValues } from "react-hook-form";
import { DeptTree } from "./trees/Department.tree.type";

// File and version data structure from API
export interface FileVersion {
  _id: string;
  fileId: string;
  fileUrl: string;
  originalName: string;
  version: number;
  fileType: string;
  isCurrentVersion: boolean;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface FileData {
  _id: string;
  originalName: string;
  entityType: string;
  entityId: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currentVersion: FileVersion;
}

export interface DepartmentType {
  id: string;
  name: string;
  goal: string;
  category: string;
  mainTasks: string;
  parent_department: {
    id: string;
  } | null;
  supportingFiles: FileData[];
  requiredReports: {
    name: string;
    templateFileId: FileData | string;
    _id: string;
  }[];
  developmentPrograms: {
    programName: string;
    objective: string;
    notes: string;
    programFileId: FileData | string;
    _id: string;
  }[];
  numericOwners: { category: string; count: number }[];
  createdAt: string;
  updatedAt: string;
  description?: string;
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
