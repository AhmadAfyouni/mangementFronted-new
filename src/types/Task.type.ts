import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

export default interface ITask {
  id: string;
  name: string;
  description: string;
  task_type: {
    id: string;
    name: string;
    description?: string;
  };
  priority: number;
  emp?: {
    id: string;
    name: string;
    address?: string;
    department?: {
      id: string;
      name: string;
    };
    dob?: string;
    job?: {
      id: string;
      name: string;
      title: string;
      department?: {
        parent_department_id: string | null;
      };
      grade_level: string;
      description?: string;
      responsibilities?: string[];
      permissions?: string[];
    };
    phone?: string;
    email?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  status: {
    id: string;
    name: string;
    description?: string;
  };
  due_date: string;
  files?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFormInputs {
  id: string;
  name: string;
  description: string;
  task_type?: string;
  priority: string;
  emp?: string;
  department_id?: string;
  project_id?: string;
  section_id?: string;
  status?: string;
  assignee?: string;
  due_date: string;
  start_date: string;
  actual_end_date?: string;
  expected_end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  files?: string[];
  isRecurring?: boolean;
  recurringType?: string;
  intervalInDays?: number;
  recurringEndDate?: string;
  isRoutineTask?: boolean;
  routineTaskId?: string;
  progressCalculationMethod?: string;
  parent_task?: string;
  end_date?: string;
  rate?: number;
}

export interface ITaskStatus {
  id: string;
  name: string;
  description: string;
}

export interface ITaskType {
  id: string;
  name: string;
  description: string;
}

// Props for the CreateTask component
export interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
  taskData?: TaskFormInputs | null;
}

export interface TaskStatusFormInputs {
  id: string;
  name: string;
  description: string;
}

export interface CreateTaskStatusProps {
  isOpen: boolean;
  onClose: () => void;
  taskStatusData?: TaskStatusFormInputs | null;
}

export interface TaskTypeFormInputs {
  id: string;
  name: string;
  description: string;
}

export interface CreateTaskTypeProps {
  isOpen: boolean;
  onClose: () => void;
  taskTypeData?: TaskTypeFormInputs | null;
}

export interface HandleEditTypeClickProps {
  taskType: ITaskType;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setEditData: Dispatch<SetStateAction<ITaskType | null>>;
}
export interface HandleEditStatusClickProps {
  taskStatus: ITaskStatus;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setEditData: Dispatch<SetStateAction<ITaskStatus | null>>;
}

export interface HandleDeleteStatusClick {
  id: string;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<ITaskStatus[], Error>>;
}

export type ListTask = {
  taskData: ITask;
  isCompleted?: boolean;
  isOverdue?: boolean;
};

type TaskEmployeeType = {
  _id: string;
  name: string;
  national_id: string;
  dob: string;
  gender: "male" | "female" | "other";
  marital_status: "single" | "married";
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  legal_documents: {
    name: string;
    validity: string;
    file: string;
  }[];
  certifications: {
    certificate_name: string;
    date: string;
    grade: string;
    file: string;
  }[];
  employment_date: string;
  department: {
    name: string;
    id: string;
  };
  job: {
    id: string;
    name: string;
    title: string;
    grade_level: string;
    description: string;
    responsibilities: string[];
    permissions: string[];
    accessibleDepartments: [];
    is_manager: boolean;
    department: string;
    category: {
      id: string;
      description: string;
      name: string;
      required_education: string;
      required_skills: string[];
      required_experience: string;
    };
  };
  job_tasks: string;
  base_salary: number;
  allowances: {
    amount: number;
    allowance_type: string;
  }[];
  incentives: {
    amount: number;
    description: string;
  }[];
  bank_accounts: {
    bank_name: string;
    account_number: string;
  }[];
  evaluations: {
    evaluation_type: string;
    description: string;
    plan: string;
  }[];
};

export type TimeLog = {
  start: string;
  _id: string;
  end: string;
};

type Section = {
  _id: string;
  name: string;
  department: string;
  createdAt: string; // ISO date format
  updatedAt: string; // ISO date format
  __v: number;
};

// Define interfaces for the department-related types
interface DepartmentFile {
  currentVersion: {
    fileUrl: string;
    version: number;
    createdAt: string;
    description?: string;
  };
  versions?: Array<{
    fileUrl: string;
    version: number;
    createdAt: string;
    description?: string;
  }>;
}

interface NumericOwner {
  category: string;
  count: number;
}

interface RequiredReport {
  name: string;
  templateFile: string;
}

interface DevelopmentProgram {
  name: string;
  programFile: string;
  objective?: string;
  notes?: string;
}

export type ReceiveTaskType = {
  id: string;
  name: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  emp?: TaskEmployeeType | null;
  assignee?: TaskEmployeeType | null;
  status: "PENDING" | "ONGOING" | "ON_TEST" | "DONE" | "CLOSED" | "CANCELED" | string;
  createdAt: string;
  updatedAt: string;
  due_date: string;
  start_date: string;
  actual_end_date?: string;
  expected_end_date?: string;

  // Time tracking fields
  estimated_hours?: number;
  actual_hours?: number;
  totalTimeSpent: number;
  startTime?: string;
  timeLogs: TimeLog[];

  // File management
  files: string[];

  // Status and progress
  is_over_due: boolean;
  progress: number;
  progressCalculationMethod?: string;
  hasLoggedHours?: boolean;
  isActive?: boolean;

  // Recurring task fields
  isRecurring?: boolean;
  recurringType?: string;
  intervalInDays?: number;
  recurringEndDate?: string;

  // Routine task fields
  isRoutineTask?: boolean;
  routineTaskId?: string;

  // Relationships
  parent_task?: string;
  sub_tasks?: string[];
  dependencies?: string[];
  subtasks?: ReceiveTaskType[];

  // Organization
  section?: Section;
  department?: {
    _id: string,
    name: string,
    goal: string,
    category: string,
    mainTasks: string,
    supportingFiles: DepartmentFile[],
    numericOwners: NumericOwner[],
    requiredReports: RequiredReport[],
    developmentPrograms: DevelopmentProgram[],
  };
  project?: {
    _id: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    departments?: Array<{ _id: string; name: string }>;
    adminDepartment?: { _id: string; name: string };
  } | null;

  // Board customization
  boardPosition?: string;
  boardOrder?: number;

  // Legacy fields
  over_all_time?: string;
  rate?: number;
  end_date?: string;
};

export type ExtendedReceiveTaskType = ReceiveTaskType & {
  section: Section;
  subTasks: ExtendedReceiveTaskType[];
};