import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentsTotalType } from "@/types/DepartmentType.type";
import { JobTitleFormInputs } from "@/types/JobTitle.type";
import React from "react";
import { UseFormRegister } from "react-hook-form";
import Select from "react-select";

interface ConditionalDropdownsProps {
  permissionsSelected: string[];
  departments: DepartmentsTotalType;
  specificDept: string[];
  setSpecificDept: (value: string[]) => void;
  specificEmp: string[];
  setSpecificEmp: (value: string[]) => void;
  specificJobTitle: string[];
  setSpecificJobTitle: (value: string[]) => void;
  getDepartmentOptions: (tree: DepartmentsTotalType['tree']) => { value: string; label: string }[];
  register: UseFormRegister<JobTitleFormInputs>;
}

const ConditionalDropdowns: React.FC<ConditionalDropdownsProps> = ({
  permissionsSelected,
  departments,
  specificDept,
  setSpecificDept,
  specificEmp,
  setSpecificEmp,
  specificJobTitle,
  setSpecificJobTitle,
  getDepartmentOptions,
  register,
}) => {

    const {t} = useLanguage()
    const {isLightMode} = useCustomTheme()
    return (
    <>
      {permissionsSelected.includes("department_view_specific") && (
        <div>
          <label className="block text-sm font-medium">{t("Specific Department")}</label>
          <Select
            {...register("accessibleDepartments")}
            isMulti
            value={getDepartmentOptions(departments?.tree).filter((option) =>
              specificDept.includes(option.value)
            )}
            options={getDepartmentOptions(departments?.tree)}
            onChange={(selectedOptions) =>
              setSpecificDept(selectedOptions.map((option) => option.value))
            }
            className={`mt-1 text-tblackAF ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} outline-none border-none`}
            placeholder={t("Select Accessible Departments...")}
          />
        </div>
      )}
      {permissionsSelected.includes("emp_view_specific") && (
        <div>
          <label className="block text-sm font-medium">{t("Specific Employee")}</label>
          <Select
            {...register("accessibleEmps")}
            isMulti
            value={getDepartmentOptions(departments?.tree).filter((option) =>
              specificEmp.includes(option.value)
            )}
            options={getDepartmentOptions(departments?.tree)}
            onChange={(selectedOptions) =>
              setSpecificEmp(selectedOptions.map((option) => option.value))
            }
            className={`mt-1 text-tblackAF ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} outline-none border-none`}
            placeholder={t("Select Accessible Employees...")}
          />
        </div>
      )}
      {permissionsSelected.includes("job_title_view_specific") && (
        <div>
          <label className="block text-sm font-medium">{t("Specific Job Title")}</label>
          <Select
            {...register("accessibleJobTitles")}
            isMulti
            value={getDepartmentOptions(departments?.tree).filter((option) =>
              specificJobTitle.includes(option.value)
            )}
            options={getDepartmentOptions(departments?.tree)}
            onChange={(selectedOptions) =>
              setSpecificJobTitle(selectedOptions.map((option) => option.value))
            }
            className={`mt-1 text-tblackAF ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} outline-none border-none`}
            placeholder={t("Select Accessible Job Titles...")}
          />
        </div>
      )}
    </>
  );
};

export default ConditionalDropdowns;