/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HandleDeleteEmployeeClick,
  HandleSubmitOptions,
} from "@/types/EmployeeType.type";
import { apiClient } from "@/utils/axios/usage";
import FileUploadService from "./fileUpload.service";

export const handleFormSubmit = ({
  data,
  addEmployee,
}: HandleSubmitOptions) => {
  console.log("employees data : ", data);

  addEmployee(data);
};

// In employee.service.ts
export const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number,
  fieldName: string,
  setValue: any
): Promise<void> => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fileName = await FileUploadService.uploadSingleFile(
    {
      file,
      name: file.name,
    },
    "employees"
  );
  setValue(`${fieldName}.${index}.file`, fileName);
};

export const handleDeleteClick = async ({
  id,
  refetch,
}: HandleDeleteEmployeeClick) => {
  try {
    await apiClient.delete(`/emp/delete/${id}`);
    refetch();
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};
