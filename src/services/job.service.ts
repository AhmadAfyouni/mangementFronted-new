import {
  AddEducationHandlerParams,
  AddExperienceHandlerParams,
} from "@/types/JobCategory.type";
import { HandlePermissionsChangeParams } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";

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
  const selectedValues = selectedOptions.map((option) => option.value);
  setPermissionsSelected(selectedValues);

  if (selectedValues.includes("department_view_specific")) {
    setSpecificDept(specificDept);
  } else {
    setSpecificDept([]);
  }

  if (selectedValues.includes("emp_view_specific")) {
    setSpecificEmp(specificEmp);
  } else {
    setSpecificEmp([]);
  }

  if (selectedValues.includes("job_title_view_specific")) {
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
