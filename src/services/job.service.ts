import {
  AddEducationHandlerParams,
  AddExperienceHandlerParams,
} from "@/types/JobCategory.type";
import { HandlePermissionsChangeParams, RoutineTaskType, PermissionsEnum, ProjectStatus, JobTitleFormInputs, JobTitleType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { apiClient } from "@/utils/axios/usage";

// Define a generic NestJS response type
interface NestJSResponse<T> {
  data: T;
}

export const addEducationService = ({
  newEducation,
  setValue,
  setRequiredEducationOptions,
}: AddEducationHandlerParams) => {
  if (newEducation.trim() !== "") {
    setRequiredEducationOptions((prevOptions) => [
      ...prevOptions,
      newEducation,
    ]);
    setValue("required_education", newEducation);
  }
};

export const addExperienceService = ({
  newExperience,

  setValue,
  setRequiredExperienceOptions,
}: AddExperienceHandlerParams) => {
  if (newExperience.trim() !== "") {
    setRequiredExperienceOptions((prevOptions) => [
      ...prevOptions,
      newExperience,
    ]);
    setValue("required_experience", newExperience);

  }
};

export const handlePermissionsChange = ({
  selectedOptions,
  setPermissionsSelected,
  setSpecificDept,
  setSpecificEmp,
  setSpecificJobTitle,
  specificDept,
  specificEmp,
  specificJobTitle,
}: HandlePermissionsChangeParams) => {
  const selectedValues = selectedOptions.map((option) => option.value as PermissionsEnum);
  setPermissionsSelected(selectedValues);

  if (selectedValues.includes("department_view_specific" as PermissionsEnum)) {
    setSpecificDept(specificDept);
  } else {
    setSpecificDept([]);
  }

  if (selectedValues.includes("emp_view_specific" as PermissionsEnum)) {
    setSpecificEmp(specificEmp);
  } else {
    setSpecificEmp([]);
  }

  if (selectedValues.includes("job_title_view_specific" as PermissionsEnum)) {
    setSpecificJobTitle(specificJobTitle);
  } else {
    setSpecificJobTitle([]);
  }
};

export const getDepartmentOptions = (departments: DeptTree[] | undefined) =>
  departments
    ? departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    }))
    : [];

export const updateRoutineTaskStatus = async (
  jobTitleId: string,
  taskId: string,
  status: ProjectStatus
): Promise<RoutineTaskType> => {
  try {
    const response = await apiClient.patch<NestJSResponse<RoutineTaskType>>(
      `/job-titles/${jobTitleId}/routine-tasks/${taskId}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating routine task status:", error);
    throw error;
  }
};

// New functions for the NestJS backend
export const createJobTitle = async (jobTitleData: JobTitleFormInputs): Promise<JobTitleType> => {
  try {
    const response = await apiClient.post<NestJSResponse<JobTitleType>>(
      '/job-titles/create',
      jobTitleData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating job title:", error);
    throw error;
  }
};

export const updateJobTitle = async (id: string, jobTitleData: JobTitleFormInputs): Promise<JobTitleType> => {
  try {
    const response = await apiClient.post<NestJSResponse<JobTitleType>>(
      `/job-titles/update/${id}`,
      jobTitleData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job title:", error);
    throw error;
  }
};

export const getAllJobTitles = async (): Promise<JobTitleType[]> => {
  try {
    const response = await apiClient.get<NestJSResponse<JobTitleType[]>>(
      '/job-titles/get-job-titles'
    );
    return response.data;
  } catch (error) {
    console.error("Error getting all job titles:", error);
    throw error;
  }
};

export const getAccessibleJobTitles = async (): Promise<JobTitleType[]> => {
  try {
    const response = await apiClient.get<NestJSResponse<JobTitleType[]>>(
      '/job-titles/view'
    );
    return response.data;
  } catch (error) {
    console.error("Error getting accessible job titles:", error);
    throw error;
  }
};

export const getJobTitleById = async (id: string): Promise<JobTitleType> => {
  try {
    const response = await apiClient.get<NestJSResponse<JobTitleType>>(
      `/job-titles/find/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting job title with id ${id}:`, error);
    throw error;
  }
};

export const deleteJobTitle = async (id: string): Promise<void> => {
  try {
    await apiClient.post(`/job-titles/delete/${id}`);
  } catch (error) {
    console.error(`Error deleting job title with id ${id}:`, error);
    throw error;
  }
};

