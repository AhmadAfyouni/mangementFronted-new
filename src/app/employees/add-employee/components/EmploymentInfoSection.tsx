import { Calendar, DollarSign, Building2, Briefcase, AlertCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormGetValues, FieldErrors } from "react-hook-form";
import { EmployeeFormInputs } from "@/types/EmployeeType.type";
import { DepartmentType } from "@/types/DepartmentType.type";
import { DeptTree } from "@/types/trees/Department.tree.type";

// Extended types to handle API inconsistencies with id/_id fields
interface ApiDepartment extends DeptTree {
  _id?: string; // Some API responses use _id instead of id
}

// Define a separate interface for API job responses that matches the actual structure
export interface ApiJobTitle {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  responsibilities: string[];
  permissions: string[];
  accessibleDepartments: string[];
  accessibleEmps: string[];
  accessibleJobTitles: string[];
  is_manager: boolean;
  category: {
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
    required_education?: string;
    required_experience?: string;
    required_skills?: string[];
    [key: string]: unknown;
  };
  department?: {
    id?: string;
    _id?: string;
    name?: string;
    [key: string]: unknown;
  };
  routineTasks?: unknown[];
  hasRoutineTasks?: boolean;
  autoGenerateRoutineTasks?: boolean;
}

const EmploymentInfoSection = ({
  register,
  errors,
  departments,
  jobs,
  setValue,
  employeeData,
  getValues,
  selectedDept,
}: {
  register: UseFormRegister<EmployeeFormInputs>;
  errors: FieldErrors<EmployeeFormInputs>;
  departments: { info: DepartmentType[]; tree: ApiDepartment[] } | undefined;
  jobs: ApiJobTitle[] | undefined;
  setValue: UseFormSetValue<EmployeeFormInputs>;
  employeeData: EmployeeFormInputs | null | undefined;
  getValues: UseFormGetValues<EmployeeFormInputs>;
  selectedDept: string | undefined;
}) => {
  const { t } = useTranslation();

  // Local state to track selected department for immediate UI updates
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
    employeeData?.department_id || getValues("department_id") || selectedDept || ""
  );

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeptId = e.target.value;
    setSelectedDepartmentId(newDeptId); // Update local state immediately
    setValue("department_id", newDeptId);
    // Clear job selection when department changes
    setValue("job_id", "");
  };

  // Use local state for filtering jobs to ensure immediate updates
  const currentDepartmentId = selectedDepartmentId;

  // Use useMemo to prevent filteredJobs from being recalculated on every render
  const filteredJobs = useMemo(() => {
    return jobs?.filter((job: ApiJobTitle) => {
      // Handle both _id and id formats for department matching
      const jobDeptId = job.department?._id || job.department?.id;
      return jobDeptId === currentDepartmentId;
    }) || [];
  }, [jobs, currentDepartmentId]);

  // Effect to sync local state with form state on initial load
  useEffect(() => {
    const formDeptId = getValues("department_id");
    if (formDeptId && formDeptId !== selectedDepartmentId) {
      setSelectedDepartmentId(formDeptId);
    }
  }, [employeeData, getValues, selectedDepartmentId]);

  // Effect to clear job selection if current job is not in filtered jobs
  useEffect(() => {
    const currentJobId = getValues("job_id");
    if (currentJobId && filteredJobs.length > 0) {
      const isCurrentJobValid = filteredJobs.some((job: ApiJobTitle) => (job._id || job.id) === currentJobId);
      if (!isCurrentJobValid) {
        setValue("job_id", "");
      }
    }
  }, [currentDepartmentId, filteredJobs, getValues, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Employment Date */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          {t("Employment Date")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("employment_date")}
            type="date"
            placeholder={t("Select employment date")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
          {errors.employment_date && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.employment_date && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.employment_date.message}
          </p>
        )}
      </div>

      {/* Base Salary */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          {t("Base Salary")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("base_salary")}
            type="number"
            placeholder={t("Enter base salary")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
          {errors.base_salary && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.base_salary && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.base_salary.message}
          </p>
        )}
      </div>

      {/* Job Tasks */}
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          {t("Job Tasks")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("job_tasks")}
            type="text"
            placeholder={t("Enter job tasks")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
          {errors.job_tasks && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.job_tasks && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.job_tasks.message}
          </p>
        )}
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
          <Building2 className="w-4 h-4 text-purple-400" />
          {t("Department")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            disabled={!!employeeData}
            {...register("department_id")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors appearance-none"
            onChange={handleDepartmentChange}
          >
            <option value="">{t("Select a department")}</option>
            {departments &&
              departments.tree &&
              departments.tree.map((dept: ApiDepartment) => (
                <option key={dept._id || dept.id} value={dept._id || dept.id}>
                  {dept.name}
                </option>
              ))}
          </select>
          {errors.department_id && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.department_id && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.department_id.message}
          </p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
          <Briefcase className="w-4 h-4 text-purple-400" />
          {t("Job Title")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            disabled={!!employeeData || !currentDepartmentId}
            {...register("job_id")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!currentDepartmentId
                ? t("Select a department first")
                : filteredJobs.length === 0
                  ? t("No job titles available for this department")
                  : t("Select a job title")
              }
            </option>
            {filteredJobs.map((job: ApiJobTitle) => (
              <option key={job._id || job.id} value={job._id || job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {errors.job_id && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.job_id && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.job_id.message}
          </p>
        )}
        {!currentDepartmentId && (
          <p className="text-gray-500 mt-1.5 text-sm">
            {t("Please select a department to see available job titles")}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmploymentInfoSection;