import { DepartmentType } from "./DepartmentType.type";

export enum PermissionsEnum {
  // Your actual permissions enum values here
  // These would match what's in your backend
  ADMIN = 'admin',
  USER = 'user',
  // Add other permissions as needed
}

// Define types for our recurring types and priority levels
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PriorityLevel = 'low' | 'medium' | 'high';

export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface RoutineTaskType {
  id: string;
  name: string;
  description: string;
  recurringType: RecurringType;
  intervalDays: number;
  estimatedHours: number;
  priority: PriorityLevel;
  isActive: boolean;
  status?: ProjectStatus;
  instructions: string[];
  hasSubTasks: boolean;
  subTasks: { name: string; description: string; estimatedHours: number }[];
}

export interface CreateRoutineTaskDto {
  name: string;
  description: string;
  recurringType: RecurringType;
  intervalDays?: number;
  estimatedHours?: number;
  priority: PriorityLevel;
  isActive?: boolean;
  instructions?: string[];
  hasSubTasks?: boolean;
  subTasks?: { name: string; description: string; estimatedHours: number }[];
}

export interface JobTitleType {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  permissions: PermissionsEnum[];
  accessibleDepartments: string[];
  accessibleEmps: string[];
  accessibleJobTitles: string[];
  is_manager: boolean;
  category: JobCategoryType;
  department: DepartmentType;
  routineTasks: RoutineTaskType[];
  hasRoutineTasks: boolean;
  autoGenerateRoutineTasks: boolean;
}

export interface EditJobTitleType {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  permissions: PermissionsEnum[];
  accessibleDepartments: string[];
  accessibleEmps: string[];
  accessibleJobTitles: string[];
  is_manager: boolean;
  category: string;
  department_id: string;
  routineTasks: CreateRoutineTaskDto[];
  hasRoutineTasks: boolean;
  autoGenerateRoutineTasks: boolean;
}

export interface JobCategoryType {
  id: string;
  name: string;
  description: string;
  required_education: string;
  required_experience: string;
  required_skills: string[];
}

export interface JobTitleFormInputs {
  id?: string;
  title: string;
  description: string;
  responsibilities: string[];
  permissions: PermissionsEnum[];
  department_id: string;
  category: string;
  is_manager: boolean;
  accessibleDepartments?: string[] | null;
  accessibleEmps?: string[] | null;
  accessibleJobTitles?: string[] | null;
  routineTasks: CreateRoutineTaskDto[];
  hasRoutineTasks: boolean;
  autoGenerateRoutineTasks: boolean;
}

export interface HandlePermissionsChangeParams {
  selectedOptions: Array<{ value: string; label: string }>;
  setPermissionsSelected: (permissions: PermissionsEnum[]) => void;
  setSpecificDept: (specificDept: string[]) => void;
  specificDept: string[];
  setSpecificEmp: (specificEmp: string[]) => void;
  specificEmp: string[];
  setSpecificJobTitle: (specificJobTitle: string[]) => void;
  specificJobTitle: string[];
}
