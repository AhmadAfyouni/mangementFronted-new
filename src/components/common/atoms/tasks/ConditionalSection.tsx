/* eslint-disable @typescript-eslint/no-explicit-any */
// ConditionalSection.tsx
import { ProjectType } from "@/types/Project.type";
import { TaskFormInputs } from "@/types/Task.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { selectStyle } from "@/utils/SelectStyle";
import React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import Select from "react-select";

interface ConditionalSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  isLightMode: boolean;
  t: (key: string) => string;
  isProjectDisabled: boolean;
  isDepartmentDisabled: boolean;
  isEmployeeDisabled: boolean;
  projects?: ProjectType[];
  departments?: { tree: DeptTree[] };
  employees?: { tree: EmpTree[] };
  selectedEmp: any;
  setSelectedEmp: (value: any) => void;
}

export const ConditionalSection: React.FC<ConditionalSectionProps> = ({
  register,
  errors,
  isLightMode,
  t,
  isProjectDisabled,
  isDepartmentDisabled,
  isEmployeeDisabled,
  projects,
  departments,
  employees,
  selectedEmp,
  setSelectedEmp,
}) => {
  return (
    <>
      {!isProjectDisabled && (
        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Project")}
          </label>
          <select
            {...register("project_id")}
            className={`${
              isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 mt-1 rounded-lg border ${
              errors.project_id ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isProjectDisabled}
          >
            <option className="" value="">
              {t("Select a project (optional)")}
            </option>
            {projects?.map((project) => (
              <option className="" key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <p className="text-red-500 mt-1 text-sm">
              {errors.project_id.message}
            </p>
          )}
        </div>
      )}

      {!isDepartmentDisabled && (
        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Department")}
          </label>
          <select
            {...register("department_id")}
            className={`${
              isLightMode ? "bg-dark" : "bg-secondary"
            } border-none outline-none w-full px-4 py-2 disabled:hidden mt-1 rounded-lg border ${
              errors.department_id ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isDepartmentDisabled}
          >
            <option value="" className="">
              {t("Select a department (optional)")}
            </option>
            {departments?.tree.map((dept) => (
              <option className="" key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && (
            <p className="text-red-500 mt-1 text-sm">
              {errors.department_id.message}
            </p>
          )}
        </div>
      )}

      {!isEmployeeDisabled && (
        <div>
          <label className="block text-tmid text-sm font-medium">
            {t("Assigned Employee")}
          </label>
          {employees && (
            <>
              <Select
                options={
                  employees?.tree.map((employee) => ({
                    value: employee.id,
                    label: `${employee.name} - ${employee.title}`,
                  })) || []
                }
                value={selectedEmp}
                onChange={(selected) => {
                  setSelectedEmp(selected);
                  register("emp").onChange({
                    target: {
                      value: selected?.value || null,
                      name: "emp",
                    },
                  });
                }}
                className="mt-1 text-tblackAF"
                placeholder={t("Select Employee")}
                styles={selectStyle}
              />

              {errors.emp && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.emp.message}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
