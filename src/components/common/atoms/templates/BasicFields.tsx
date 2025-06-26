import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import { FormData, Option } from "@/types/new-template.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import React from "react";
import { MultiValue, SingleValue } from "react-select";
import { CustomInput } from "../ui/CustomInput";
import CustomReactSelect from "../ui/CustomReactSelect";
import { CustomTextarea } from "../ui/CustomTextarea";
import DynamicToggle from "../ui/DynamicToggle";

// Helper function to get department employees
const getDepartmentEmployees = (
  departments: { tree: DeptTree[] } | undefined,
  departmentId: string
) => {
  const department = departments?.tree?.find(
    (dept) => dept.id === departmentId
  );
  return (
    department?.emps?.map((emp) => ({
      value: emp.id,
      label: `${emp.name} (${emp.title})`,
    })) || []
  );
};

// Optional Employee Selection Component
const OptionalEmployeeSelect = ({
  departmentName,
  employees,
  value,
  onChange,
}: {
  departmentName: string;
  employees: Option[];
  value: Option | undefined;
  onChange: (newValue: SingleValue<Option>) => void;
}) => {
  const { t, getDir } = useLanguage();
  if (employees.length === 0) return null;
  return (
    <div className="ml-6 mt-4 p-4 border-l-2 border-dashed border-slate-600 bg-main rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-400 italic">
          {t("Employee Selection")}
        </span>
      </div>

      <CustomReactSelect
        label={
          getDir() == "rtl"
            ? `${t("Employee")} ${departmentName}`
            : `${departmentName} ${t("Employee")}`
        }
        options={employees}
        value={value}
        onChange={onChange}
        placeholder={t("Default to Department Manager")}
        isClearable={true}
        noOptionsMessage={() => t("No employees in this department")}
      />
    </div>
  );
};

const BasicFields: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}> = ({ formData, setFormData }) => {
  const { t } = useLanguage();

  const { data: departments } = useCustomQuery<{
    info: DepartmentType[];
    tree: DeptTree[];
  }>({
    queryKey: ["departments"],
    url: `/department/tree`,
  });

  const handleTypeChange = (newValue: SingleValue<Option>) => {
    setFormData((prev) => ({
      ...prev,
      type: newValue?.value || "",
    }));
  };

  const handleDurationTypeChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        duration: {
          ...prev.duration,
          unit: newValue.value as "days" | "hours" | "months",
        },
      }));
    }
  };

  const handleApprovalTrackChange = (newValue: MultiValue<Option>) => {
    setFormData((prev) => {
      const newTrack = newValue.map((opt) => {
        // If department already exists, keep its employee assignment
        const existingTrack = prev.departments_approval_track.find(
          (track) => track.department === opt.value
        );
        return existingTrack || { department: opt.value };
      });

      return {
        ...prev,
        departments_approval_track: newTrack,
      };
    });
  };

  const handleExecutionDepartmentsChange = (newValue: MultiValue<Option>) => {
    setFormData((prev) => {
      const newExecution = newValue.map((opt) => {
        // If department already exists, keep its employee assignment
        const existingExec = prev.departments_execution_ids.find(
          (exec) => exec.department === opt.value
        );
        return existingExec || { department: opt.value };
      });

      return {
        ...prev,
        departments_execution_ids: newExecution,
      };
    });
  };

  const handleArchiveDeptChange = (newValue: MultiValue<Option>) => {
    setFormData((prev) => ({
      ...prev,
      departments_archive: newValue.map((opt) => ({
        department: opt.value,
      })),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      duration: {
        ...prev.duration,
        value: parseInt(value) || 0,
      },
    }));
  };

  const handleApprovalEmployeeChange = (
    index: number,
    newValue: SingleValue<Option>
  ) => {
    setFormData((prev) => ({
      ...prev,
      departments_approval_track: prev.departments_approval_track.map(
        (item, i) => {
          if (i === index) {
            return newValue
              ? { department: item.department, employee: newValue.value }
              : { department: item.department };
          }
          return item;
        }
      ),
    }));
  };

  const handleExecutionEmployeeChange = (
    index: number,
    newValue: SingleValue<Option>
  ) => {
    setFormData((prev) => ({
      ...prev,
      departments_execution_ids: prev.departments_execution_ids.map(
        (item, i) => {
          if (i === index) {
            return newValue
              ? { department: item.department, employee: newValue.value }
              : { department: item.department };
          }
          return item;
        }
      ),
    }));
  };

  const transactionTypes: Option[] = [
    { value: "internal", label: t("Internal") },
    { value: "external", label: t("External") },
  ];

  const durationTypes: Option[] = [
    { value: "days", label: t("Days") },
    { value: "hours", label: t("Hours") },
    { value: "months", label: t("Months") },
  ];

  const departmentOptions: Option[] =
    departments?.tree?.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <CustomInput
          label={t("Transaction Name")}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t("Set Transaction Name")}
          required
        />

        <CustomReactSelect
          label={t("Transaction Type")}
          options={transactionTypes}
          value={transactionTypes.find((type) => type.value === formData.type)}
          onChange={handleTypeChange}
          placeholder={t("Set Transaction Type")}
          isSearchable={false}
        />

        <CustomTextarea
          label={t("Description")}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          placeholder={t("Enter transaction description")}
        />

        {/* Approval Track Section */}
        <div className="gap-4">
          <div className="p-4 bg-dark rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">
                {t("Select Approval Track Departments")} <span className="text-red-400">*</span>
              </label>
              <CustomReactSelect
                label={t("Select Approval Track Departments")}
                isMulti
                options={departmentOptions}
                value={
                  formData.departments_approval_track
                    .map((track) =>
                      departmentOptions.find(
                        (opt) => opt.value === track.department
                      )
                    )
                    .filter(Boolean) as Option[]
                }
                onChange={handleApprovalTrackChange}
                placeholder={t("Select in approval order")}
                noOptionsMessage={() => t("No more options available")}
                isClearable={false}
              />
            </div>

            {formData.departments_approval_track.map((track, index) => {
              const currentDept = departments?.tree?.find(
                (d) => d.id === track.department
              );
              const departmentEmployees = getDepartmentEmployees(
                departments,
                track.department
              );

              return (
                <OptionalEmployeeSelect
                  key={`${track.department}-${index}`}
                  departmentName={currentDept?.name || ""}
                  employees={departmentEmployees}
                  value={departmentEmployees.find(
                    (opt) => opt.value === track.employee
                  )}
                  onChange={(newValue) =>
                    handleApprovalEmployeeChange(index, newValue)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Execution Section */}
        <div className="gap-4">
          <div className="p-4 bg-dark rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">
                {t("Execution Departments")} <span className="text-red-400">*</span>
              </label>
              <CustomReactSelect
                label={t("Execution Departments")}
                isMulti
                options={departmentOptions}
                value={
                  formData.departments_execution_ids
                    .map((exec) =>
                      departmentOptions.find(
                        (opt) => opt.value === exec.department
                      )
                    )
                    .filter(Boolean) as Option[]
                }
                onChange={handleExecutionDepartmentsChange}
                placeholder={t("Select departments")}
              />
            </div>

            {formData.departments_execution_ids.map((dept, index) => {
              const currentDept = departments?.tree?.find(
                (d) => d.id === dept.department
              );
              const departmentEmployees = getDepartmentEmployees(
                departments,
                dept.department
              );

              return (
                <OptionalEmployeeSelect
                  key={`${dept.department}-${index}`}
                  departmentName={currentDept?.name || ""}
                  employees={departmentEmployees}
                  value={departmentEmployees.find(
                    (opt) => opt.value === dept.employee
                  )}
                  onChange={(newValue) =>
                    handleExecutionEmployeeChange(index, newValue)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Archive Departments */}
        <CustomReactSelect
          label={t("Archive Departments")}
          isMulti
          options={departmentOptions}
          value={
            formData.departments_archive
              .map((archive) =>
                departmentOptions.find(
                  (opt) => opt.value === archive.department
                )
              )
              .filter(Boolean) as Option[]
          }
          onChange={handleArchiveDeptChange}
          placeholder={t("Select archive departments")}
        />

        {/* Duration Section */}
        <div>
          <label className="text-sm font-medium text-twhite">
            {t("Duration")}
          </label>
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-2 w-2/3">
              <CustomReactSelect
                options={durationTypes}
                onChange={handleDurationTypeChange}
                placeholder={t("Set Duration Type")}
                isSearchable={false}
              />
            </div>
            <div className="w-1/3">
              <CustomInput
                type="number"
                label=""
                value={formData.duration?.value || ""}
                onChange={handleDurationChange}
                min="1"
                placeholder={t("Enter duration value")}
              />
            </div>
          </div>
        </div>

        <DynamicToggle
          label={t("Need Admin Approval?")}
          description={t("Enable this option if admin approval is required")}
          value={formData.needAdminApproval}
          setValue={(value) =>
            setFormData({ ...formData, needAdminApproval: value })
          }
        />
      </div>
    </div>
  );
};

export default BasicFields;
