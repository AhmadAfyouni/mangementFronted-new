// hooks/useTaskFormState.ts
import { useState, useEffect } from "react";

export const useTaskFormState = (
  selectedEmployee: string | undefined,
  selectedDepartment: string | undefined,
  selectedProject: string | undefined
) => {
  const [isEmployeeDisabled, setIsEmployeeDisabled] = useState(false);
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(false);
  const [isProjectDisabled, setIsProjectDisabled] = useState(false);

  useEffect(() => {
    if (selectedEmployee) {
      setIsDepartmentDisabled(true);
      setIsProjectDisabled(true);
    } else if (selectedDepartment && selectedProject) {
      setIsEmployeeDisabled(true);
    } else if (selectedDepartment) {
      setIsEmployeeDisabled(true);
      setIsProjectDisabled(true);
    } else if (selectedProject) {
      setIsEmployeeDisabled(true);
    } else {
      setIsEmployeeDisabled(false);
      setIsDepartmentDisabled(false);
      setIsProjectDisabled(false);
    }
  }, [selectedEmployee, selectedDepartment, selectedProject]);

  return {
    isEmployeeDisabled,
    isDepartmentDisabled,
    isProjectDisabled,
  };
};
