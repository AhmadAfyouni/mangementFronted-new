import { DepartmentType } from "./DepartmentType.type";
import { EmployeeType } from "./EmployeeType.type";
import { SectionType } from "./Section.type";
import { ReceiveTaskType } from "./Task.type";
import { DeptTree } from "./trees/Department.tree.type";

export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type ProjectType = {
  _id: string;
  name: string;
  description: string;
  departments: DepartmentType[];
  sections: SectionType[];
  members: EmployeeType[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status?: ProjectStatus;
  color: string
};

// Types for team and teamStats based on API response
export interface TeamMember {
  name: string;
  department: string;
  totalHoursWorked: number;
  totalPlannedHours: number;
  completedTasks: number;
  incompleteTasks: number;
}

export interface TeamStats {
  totalMembers: number;
  totalTeamTime: number;
  averageTimePerMember: number;
  mostActiveMembers: TeamMember[];
}

export type ProjectDetailsType = {
  _id: string;
  name: string;
  description: string;
  departments: DeptTree[];
  members: EmployeeType[];
  startDate: string;
  endDate: string;
  is_over_due: boolean;
  projectTasks: ReceiveTaskType[];
  taskDone: number;
  taskOnGoing: number;
  taskOnTest: number;
  taskPending: number;
  status?: ProjectStatus;
  color: string;
  team?: TeamMember[];
  teamStats?: {
    totalMembers: number;
    totalTeamTime: number;
    averageTimePerMember: number;
    mostActiveMembers: any[];
  };
};
