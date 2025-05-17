/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useTranslation } from "react-i18next";
import { FormInput, FormSection } from "./FormComponents";

const EmploymentInfoSection = ({
  register,
  errors,
  isLightMode,
  departments,
  jobs,
  selectedDept,
  setValue,
  employeeData,
}) => {
  const { t } = useTranslation();

  const handleDepartmentChange = (e) => {
    setValue("department_id", e.target.value);
    selectedDept(e.target.value);
  };

  return (
    <FormSection title="Employment Information" isLightMode={isLightMode}>
      <FormInput
        label="Employment Date"
        name="employment_date"
        type="date"
        register={register}
        errors={errors}
        placeholder="Select employment date"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Base Salary"
        name="base_salary"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter base salary"
        isLightMode={isLightMode}
      />

      <div className="col-span-2">
        <FormInput
          label="Job Tasks"
          name="job_tasks"
          register={register}
          errors={errors}
          placeholder="Enter job tasks"
          isLightMode={isLightMode}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("Department")}</label>
        <select
          disabled={!!employeeData}
          {...register("department_id")}
          className={`w-full px-4 py-2 rounded-lg transition-all duration-200
            ${isLightMode
              ? "bg-dark placeholder:text-tdark"
              : "bg-secondary"
            } outline-none border 
            ${errors.department_id ? "border-danger" : "border-gray-300 focus:border-primary"}
            ${!!employeeData ? "opacity-60 cursor-not-allowed" : ""}
          `}
          onChange={handleDepartmentChange}
        >
          <option value="">{t("Select a department")}</option>
          {departments &&
            departments.tree &&
            departments.tree.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
        </select>
        {errors.department_id && (
          <p className="text-danger text-xs mt-1">{errors.department_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("Job Title")}</label>
        <select
          disabled={!!employeeData}
          {...register("job_id")}
          className={`w-full px-4 py-2 rounded-lg transition-all duration-200
            ${isLightMode
              ? "bg-dark placeholder:text-tdark"
              : "bg-secondary"
            } outline-none border 
            ${errors.job_id ? "border-danger" : "border-gray-300 focus:border-primary"}
            ${!!employeeData ? "opacity-60 cursor-not-allowed" : ""}
          `}
          onChange={(e) => setValue("job_id", e.target.value)}
        >
          <option value="">{t("Select a job title")}</option>
          {jobs &&
            jobs
              .filter(
                (job) =>
                  job.department && job.department._id === selectedDept
              )
              .map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
        </select>
        {errors.job_id && (
          <p className="text-danger text-xs mt-1">{errors.job_id.message}</p>
        )}
      </div>
    </FormSection>
  );
};

export default EmploymentInfoSection;