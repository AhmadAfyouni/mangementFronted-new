/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/getTaskTarget.ts
export const getTaskTarget = (
  selectedEmployee: string | undefined,
  selectedDepartment: string | undefined,
  isProjectDisabled: boolean,
  getValues: (name: string) => any
) => {
  return selectedEmployee
    ? { emp: getValues("emp") }
    : selectedDepartment && isProjectDisabled
    ? { department_id: getValues("department_id") }
    : {
        project_id: getValues("project_id"),
        department_id: getValues("department_id"),
      };
};
