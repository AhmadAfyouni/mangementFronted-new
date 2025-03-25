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
  // task_type: string;
  priority: number;
  emp?: string;
  department_id?: string;
  project_id?: string;
  // status: string;
  due_date: string;
  files?: string[];
  isRecurring?: boolean;
  intervalInDays?: number;
  end_date?: string;
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

export interface TaskFormInputs {
  id: string;
  name: string;
  description: string;
  task_type: string;
  priority: number;
  emp?: string;
  department_id?: string;
  project_id?: string;
  status: string;
  due_date: string;
  files?: string[];
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
  id: string;
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

export type ReceiveTaskType = {
  id: string;
  name: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  emp: TaskEmployeeType;
  assignee: TaskEmployeeType;
  status: "PENDING" | "ONGOING" | "ON_TEST" | "DONE" | string;
  createdAt: string;
  updatedAt: string;
  due_date: string;
  files: string[];
  is_over_due: boolean;
  totalTimeSpent: number;
  startTime: string;
  timeLogs: TimeLog[];
  section: Section;
  parent_task?: string;
  rate?: number;
};

export type ExtendedReceiveTaskType = {
  id: string;
  name: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  emp: TaskEmployeeType;
  assignee: TaskEmployeeType;
  status: "PENDING" | "ONGOING" | "ON_TEST" | "DONE" | string;
  createdAt: string;
  updatedAt: string;
  due_date: string;
  files: string[];
  is_over_due: boolean;
  totalTimeSpent: number;
  startTime: string;
  timeLogs: TimeLog[];
  section: Section;
  parent_task?: string;
  rate?: number;
  subTasks: ExtendedReceiveTaskType[];
};
