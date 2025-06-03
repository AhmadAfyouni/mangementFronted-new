import { EmployeeType } from "@/types/EmployeeType.type";
import { ProjectDetailsType, ProjectStatus } from "@/types/Project.type";
import { apiClient } from "@/utils/axios/usage";

export const getEmployeeOptions = (employees: EmployeeType[] | undefined) =>
  employees
    ? employees.map((emp) => ({
      value: emp.id,
      label: emp.name,
    }))
    : [];

export const updateProjectStatus = async (
  projectId: string,
  status: ProjectStatus
): Promise<ProjectDetailsType> => {
  try {
    const response = await apiClient.post<ProjectDetailsType>(
      `/projects/update/${projectId}`,
      { status }
    );
    return response;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};


