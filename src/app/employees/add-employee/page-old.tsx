/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMokkBar } from "@/components/Providers/Mokkbar";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useQueryPageData from "@/hooks/useQueryPageData";
import { addEmpSchema } from "@/schemas/employee.schema";
import {
  handleFileChange,
  handleFormSubmit,
} from "@/services/employee.service";
import { DepartmentType } from "@/types/DepartmentType.type";
import { EmployeeFormInputs } from "@/types/EmployeeType.type";
import { JobTitleType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const AddEmp: React.FC = () => {
  const { setSnackbarConfig } = useMokkBar();
  const router = useRouter();
  const [legalFileNames, setLegalFileNames] = useState<
    Record<string, Record<string, string>>
  >({
    legal_documents: {},
  });

  const [certificationFileNames, setCertificationFileNames] = useState<
    Record<string, Record<string, string>>
  >({
    certifications: {},
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<EmployeeFormInputs>({
    resolver: yupResolver(addEmpSchema) as any,
    defaultValues: {},
  });

  const employeeData = useQueryPageData<EmployeeFormInputs>(reset);


  useEffect(() => {
    if (employeeData) {
      // Handle legal documents files
      if (
        employeeData.legal_documents &&
        employeeData.legal_documents.length > 0
      ) {
        const legalFiles: Record<string, string> = {};
        employeeData.legal_documents.forEach((doc, index) => {
          if (doc.file) legalFiles[index] = doc.file;

          // Properly format the validity date for each document (YYYY-MM-DD)
          if (doc.validity) {
            // Format the date by splitting at T and using only the first part
            setValue(
              `legal_documents.${index}.validity`,
              doc.validity.split("T")[0]
            );
          }
        });
        setLegalFileNames({ legal_documents: legalFiles });
      }

      // Handle certifications files
      if (
        employeeData.certifications &&
        employeeData.certifications.length > 0
      ) {
        const certFiles: Record<string, string> = {};
        employeeData.certifications.forEach((cert, index) => {
          if (cert.file) certFiles[index] = cert.file;

          // Properly format the date for each certification (YYYY-MM-DD)
          if (cert.date) {
            // Format the date by splitting at T and using only the first part
            setValue(`certifications.${index}.date`, cert.date.split("T")[0]);
          }
        });
        setCertificationFileNames({ certifications: certFiles });
      }
    } else {
      // Reset file names for new employee
      setLegalFileNames({ legal_documents: {} });
      setCertificationFileNames({ certifications: {} });
    }
  }, [employeeData, setValue]); // Don't forget to add setValue to the dependency array
  const { isLightMode } = useCustomTheme();
  const { t } = useTranslation();
  const [selectedDept, setSelectedDept] = useState<string>("");
  const {
    fields: legalDocumentFields,
    append: appendLegalDocument,
    remove: removeLegalDocument,
  } = useFieldArray({
    control,
    name: "legal_documents",
  });
  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "certifications",
  });
  const {
    fields: allowancesFields,
    append: appendAllowance,
    remove: removeAllowance,
  } = useFieldArray({
    control,
    name: "allowances",
  });
  const {
    fields: incentivesFields,
    append: appendIncentive,
    remove: removeIncentive,
  } = useFieldArray({
    control,
    name: "incentives",
  });
  const {
    fields: bankAccountsFields,
    append: appendBankAccount,
    remove: removeBankAccount,
  } = useFieldArray({
    control,
    name: "bank_accounts",
  });
  const {
    fields: evaluationsFields,
    append: appendEvaluation,
    remove: removeEvaluation,
  } = useFieldArray({
    control,
    name: "evaluations",
  });

  const endpoint = employeeData
    ? `/emp/update/${employeeData.id}`
    : `/emp/create`;

  const { data: departments } = useCustomQuery<{
    info: DepartmentType[];
    tree: DeptTree[];
  }>({
    queryKey: ["departments"],
    url: `/department/tree`,
  });
  const { data: jobs } = useCustomQuery<JobTitleType[]>({
    queryKey: ["jobTitles"],
    url: `/job-titles/get-job-titles`,
    nestedData: true
  });

  const { mutate: addEmployee, isPending: isPendingEmployee } =
    useCreateMutation({
      endpoint: endpoint,
      onSuccessMessage: t("Employee added successfully!"),
      invalidateQueryKeys: ["employees", "employeeTree"],
      onSuccessFn: () => {
        setSnackbarConfig({
          open: true,
          message: employeeData
            ? t("Employee updated successfully!")
            : t("Employee created successfully!"),
          severity: "success",
        });
        reset();

        setTimeout(() => router.back(), 1000);
      },
    });

  const onSubmit = async (data: EmployeeFormInputs) => {
    handleFormSubmit({
      data,
      addEmployee,
    });
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);
  useEffect(() => {
    if (employeeData) {
      // First do the basic reset
      reset(employeeData);

      // Then explicitly set all fields that need special formatting

      // Basic Information
      setValue("name", employeeData.name);
      setValue("email", employeeData.email);
      setValue("phone", employeeData.phone);
      setValue("national_id", employeeData.national_id);
      setValue("address", employeeData.address);
      setValue("emergency_contact", employeeData.emergency_contact);

      // Dates formatting - Split ISO strings to get YYYY-MM-DD format
      setValue("dob", employeeData.dob ? employeeData.dob.split("T")[0] : "");
      setValue(
        "employment_date",
        employeeData.employment_date
          ? employeeData.employment_date.split("T")[0]
          : ""
      );

      // Other fields
      setValue("gender", employeeData.gender);
      setValue("marital_status", employeeData.marital_status);
      setValue("department_id", employeeData.department.id);
      setSelectedDept(employeeData.department.id);
      setValue("job_id", employeeData.job.id);
      setValue("job_tasks", employeeData.job_tasks);
      setValue("base_salary", employeeData.base_salary);

      // Process legal documents
      if (
        employeeData.legal_documents &&
        employeeData.legal_documents.length > 0
      ) {
        const legalFiles = {};
        employeeData.legal_documents.forEach((doc, index) => {
          // Set document name and file
          if (doc.name) setValue(`legal_documents.${index}.name`, doc.name);
          if (doc.file) {
            setValue(`legal_documents.${index}.file`, doc.file);
            legalFiles[index] = doc.file;
          }

          // Format dates - IMPORTANT: This must come after the reset
          if (doc.validity) {
            setValue(
              `legal_documents.${index}.validity`,
              doc.validity.split("T")[0]
            );
          }
        });
        setLegalFileNames({ legal_documents: legalFiles });
      }

      // Process certifications
      if (
        employeeData.certifications &&
        employeeData.certifications.length > 0
      ) {
        const certFiles = {};
        employeeData.certifications.forEach((cert, index) => {
          // Set certification name, grade and file
          if (cert.certificate_name)
            setValue(
              `certifications.${index}.certificate_name`,
              cert.certificate_name
            );
          if (cert.grade) setValue(`certifications.${index}.grade`, cert.grade);
          if (cert.file) {
            setValue(`certifications.${index}.file`, cert.file);
            certFiles[index] = cert.file;
          }

          // Format dates - IMPORTANT: This must come after the reset
          if (cert.date) {
            setValue(`certifications.${index}.date`, cert.date.split("T")[0]);
          }
        });
        setCertificationFileNames({ certifications: certFiles });
      }
    } else {
      // Reset everything for new employee
      reset();
      setLegalFileNames({ legal_documents: {} });
      setCertificationFileNames({ certifications: {} });
    }
  }, [employeeData, reset, setValue]);
  return (
    <GridContainer>
      <div
        className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
          }  p-8 rounded-xl shadow-lg  w-full  col-span-full  text-twhite`}
      >
        <h1 className="text-center text-2xl font-bold mb-6">
          {employeeData ? t("Update Employee") : t("Create Employee")}
        </h1>
        <form
          className="gap-4"
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <div>
            <label className="block  text-sm font-medium">{t("Name")}</label>
            <input
              type="text"
              {...register("name")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter employee name")}
            />
            {errors.name && (
              <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>
          {/* Email Field */}
          <div>
            <label className="block  text-sm font-medium">{t("Email")}</label>
            <input
              type="text"
              {...register("email")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter Employee Email")}
            />
            {errors.email && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block  text-sm font-medium">{t("Phone")}</label>
            <input
              type="text"
              {...register("phone")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter Employee phone")}
            />
            {errors.phone && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Passwword Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Password")}
            </label>
            <input
              disabled={!!employeeData}
              type="text"
              {...register("password")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={
                employeeData
                  ? t("Can't Update Employee Password")
                  : t("Enter Employee Password")
              }
            />
            {errors.password && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* National ID Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("National ID")}
            </label>
            <input
              type="text"
              {...register("national_id")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.national_id ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter national ID")}
            />
            {errors.national_id && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.national_id.message}
              </p>
            )}
          </div>
          {/* Address Field */}
          <div>
            <label className="block  text-sm font-medium">{t("Address")}</label>
            <input
              type="text"
              {...register("address")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.address ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter Address")}
            />
            {errors.address && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.address.message}
              </p>
            )}
          </div>
          {/* emergency contact Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Contact Emergency")}
            </label>
            <input
              type="text"
              {...register("emergency_contact")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.address ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter Address")}
            />
            {errors.address && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.address.message}
              </p>
            )}
          </div>
          {/* DOB Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Date Of Birth")}
            </label>
            <input
              type="date"
              {...register("dob")}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg border ${errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter employment date")}
            />
            {errors.dob && (
              <p className="text-red-500 mt-1 text-sm">{errors.dob.message}</p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <label className="block  text-sm font-medium">{t("Gender")}</label>
            <select
              {...register("gender")}
              defaultValue={employeeData && employeeData.gender}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg   placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent border ${errors.gender ? "border-high" : "border-border"
                }`}
            >
              <option value="">{t("Select a gender")}</option>
              {["male", "female", "undefined"].map((gender, index: number) => (
                <option key={index} value={gender}>
                  {t(gender)}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Marital Status Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Marital Status")}
            </label>
            <select
              {...register("marital_status")}
              value={getValues("marital_status") || ""} // Changed from defaultValue to value
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg   placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent border ${errors.marital_status ? "border-high" : "border-border"
                }`}
            >
              <option value="">{t("Select a marital status")}</option>
              {[t("single"), t("married")].map((status, index: number) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.marital_status && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.marital_status.message}
              </p>
            )}
          </div>

          {/* Employment Date Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Employment Date")}
            </label>
            <input
              type="date"
              {...register("employment_date")}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg border ${errors.employment_date ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter employment date")}
            />
            {errors.employment_date && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.employment_date.message}
              </p>
            )}
          </div>

          {/* Base Salary Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Base Salary")}
            </label>
            <input
              type="number"
              {...register("base_salary")}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg border ${errors.base_salary ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter base salary")}
            />
            {errors.base_salary && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.base_salary.message}
              </p>
            )}
          </div>
          {/* Department Dropdown */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Department")}
            </label>
            <select
              disabled={!!employeeData}
              {...register("department_id")}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg border ${errors.department_id ? "border-red-500" : "border-gray-300"
                }`}
              onChange={(e) => {
                setValue("department_id", e.target.value);
                setSelectedDept(e.target.value);
              }}
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
              <p className="text-red-500 mt-1 text-sm">
                {errors.department_id.message}
              </p>
            )}
          </div>
          {/* Job Dropdown */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Job Title")}
            </label>
            <select
              disabled={!!employeeData}
              {...register("job_id")}
              className={`w-full ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none px-4 py-2 mt-1 rounded-lg border ${errors.job_id ? "border-red-500" : "border-gray-300"
                }`}
              onChange={(e) => setValue("job_id", e.target.value)}
            >
              <option value="">{t("Select a job title")}</option>
              {jobs &&
                jobs
                  .filter(
                    (job) =>
                      job.department && job.department._id == selectedDept
                  )
                  .map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
            </select>
            {errors.job_id && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.job_id.message}
              </p>
            )}
          </div>

          {/* Job tasks  Field */}
          <div>
            <label className="block  text-sm font-medium">
              {t("Job Tasks")}
            </label>
            <input
              type="text"
              {...register("job_tasks")}
              className={`w-full  ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  outline-none border-none   px-4 py-2 mt-1 rounded-lg border ${errors.job_tasks ? "border-red-500" : "border-gray-300"
                }`}
              placeholder={t("Enter job tasks")}
            />
            {errors.job_tasks && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.job_tasks.message}
              </p>
            )}
          </div>

          {/* Legal Documents */}
          {/* Legal Documents Section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t("Legal Documents")}</h2>
              <button
                type="button"
                onClick={() =>
                  appendLegalDocument({ name: "", validity: "", file: null })
                }
                className={`px-3 py-1.5 rounded-md ${isLightMode
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-blue-900/30 text-blue-400 hover:bg-blue-800/40"
                  } text-sm flex items-center gap-1 transition-colors`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                {t("Add Document")}
              </button>
            </div>

            {legalDocumentFields.length === 0 ? (
              <div
                className={`text-center py-6 ${isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {t("No legal documents added yet")}
              </div>
            ) : (
              <div className="gap-4">
                {legalDocumentFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`p-4 rounded-lg ${isLightMode
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-dark border border-gray-700"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        {t("Document")} #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          removeLegalDocument(index);
                          reset(getValues());
                        }}
                        className={`p-1.5 rounded-full ${isLightMode
                          ? "text-red-500 hover:bg-red-50"
                          : "text-red-400 hover:bg-red-900/20"
                          }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("Document Name")}
                        </label>
                        <input
                          type="text"
                          {...register(
                            `legal_documents.${index}.name` as const
                          )}
                          placeholder={t("Enter document name")}
                          className={`w-full px-4 py-2 rounded-lg ${isLightMode
                            ? "bg-white border border-gray-300"
                            : "bg-main border border-gray-600"
                            } outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("Validity Date")}
                        </label>
                        <input
                          type="date"
                          {...register(
                            `legal_documents.${index}.validity` as const
                          )}
                          className={`w-full px-4 py-2 rounded-lg ${isLightMode
                            ? "bg-white border border-gray-300"
                            : "bg-main border border-gray-600"
                            } outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <FileUpload
                        index={index}
                        fieldName="legal_documents"
                        fileNames={legalFileNames}
                        setFileNames={setLegalFileNames}
                        handleFileChange={(e) =>
                          handleFileChange(
                            e,
                            index,
                            "legal_documents",
                            setValue
                          )
                        }
                        isLightMode={isLightMode}
                        setValue={setValue}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t("Certifications")}</h2>
              <button
                type="button"
                onClick={() =>
                  appendCertification({
                    certificate_name: "",
                    date: "",
                    grade: "",
                    file: null,
                  })
                }
                className={`px-3 py-1.5 rounded-md ${isLightMode
                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                  : "bg-green-900/30 text-green-400 hover:bg-green-800/40"
                  } text-sm flex items-center gap-1 transition-colors`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                {t("Add Certification")}
              </button>
            </div>

            {certificationFields.length === 0 ? (
              <div
                className={`text-center py-6 ${isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {t("No certifications added yet")}
              </div>
            ) : (
              <div className="gap-4">
                {certificationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`p-4 rounded-lg ${isLightMode
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-dark border border-gray-700"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        {t("Certification")} #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          removeCertification(index);
                          reset(getValues());
                        }}
                        className={`p-1.5 rounded-full ${isLightMode
                          ? "text-red-500 hover:bg-red-50"
                          : "text-red-400 hover:bg-red-900/20"
                          }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          {t("Certificate Name")}
                        </label>
                        <input
                          type="text"
                          {...register(
                            `certifications.${index}.certificate_name` as const
                          )}
                          placeholder={t("Enter certificate name")}
                          className={`w-full px-4 py-2 rounded-lg ${isLightMode
                            ? "bg-white border border-gray-300"
                            : "bg-main border border-gray-600"
                            } outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("Certification Date")}
                        </label>
                        <input
                          type="date"
                          {...register(`certifications.${index}.date` as const)}
                          className={`w-full px-4 py-2 rounded-lg ${isLightMode
                            ? "bg-white border border-gray-300"
                            : "bg-main border border-gray-600"
                            } outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("Grade/Score")}
                        </label>
                        <input
                          type="text"
                          {...register(
                            `certifications.${index}.grade` as const
                          )}
                          placeholder={t("Enter grade or score")}
                          className={`w-full px-4 py-2 rounded-lg ${isLightMode
                            ? "bg-white border border-gray-300"
                            : "bg-main border border-gray-600"
                            } outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          {t("Certificate File")}
                        </label>
                        <FileUpload
                          index={index}
                          fieldName="certifications"
                          fileNames={certificationFileNames}
                          setFileNames={setCertificationFileNames}
                          handleFileChange={(e) =>
                            handleFileChange(
                              e,
                              index,
                              "certifications",
                              setValue
                            )
                          }
                          isLightMode={isLightMode}
                          setValue={setValue}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="flex flex-col items-start gap-4 mt-4">

            {/* Allowances */}
            <button
              type="button"
              onClick={() => appendAllowance({ allowance_type: "", amount: 0 })}
              className="text-tbright block text-sm"
            >
              {t("Add Allowance")}
            </button>
            {allowancesFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block  text-sm font-medium">
                    {t("Allowance")} {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`allowances.${index}.allowance_type` as const)}
                    placeholder={t("Allowance Type")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                  <input
                    type="number"
                    {...register(`allowances.${index}.amount` as const)}
                    placeholder={t("Amount")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeAllowance(index); // Remove the specific allowance
                    reset(getValues()); // Reset the form to update the state
                  }}
                  className="text-twhite bg-red-500 font-bold  px-4 py-2 shadow-md rounded-md"
                >
                  X
                </button>
              </div>
            ))}

            {/* Incentives */}
            <button
              type="button"
              onClick={() => appendIncentive({ description: "", amount: 0 })}
              className="text-tbright block text-sm"
            >
              {t("Add Incentive")}
            </button>
            {incentivesFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block  text-sm font-medium">
                    {t("Incentive")} {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`incentives.${index}.description` as const)}
                    placeholder={t("Description")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                  <input
                    type="number"
                    {...register(`incentives.${index}.amount` as const)}
                    placeholder={t("Amount")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeIncentive(index); // Remove the specific incentive
                    reset(getValues()); // Reset the form to update the state
                  }}
                  className="text-twhite bg-red-500 font-bold  px-4 py-2 shadow-md rounded-md"
                >
                  X
                </button>
              </div>
            ))}

            {/* Bank Accounts */}
            <button
              type="button"
              onClick={() =>
                appendBankAccount({ bank_name: "", account_number: "" })
              }
              className="text-tbright block text-sm"
            >
              {t("Add Bank Account")}
            </button>
            {bankAccountsFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block  text-sm font-medium">
                    {t("Bank Account")} {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`bank_accounts.${index}.bank_name` as const)}
                    placeholder={t("Bank Name")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                  <input
                    type="text"
                    {...register(
                      `bank_accounts.${index}.account_number` as const
                    )}
                    placeholder={t("Account Number")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeBankAccount(index); // Remove the specific bank account
                    reset(getValues()); // Reset the form to update the state
                  }}
                  className="text-twhite bg-red-500 font-bold  px-4 py-2 shadow-md rounded-md"
                >
                  X
                </button>
              </div>
            ))}

            {/* Evaluations */}
            <button
              type="button"
              onClick={() =>
                appendEvaluation({
                  evaluation_type: "",
                  description: "",
                  plan: "",
                })
              }
              className="text-tbright block text-sm"
            >
              {t("Add Evaluation")}
            </button>
            {evaluationsFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block  text-sm font-medium">
                    {t("Evaluation")} {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`evaluations.${index}.evaluation_type` as const)}
                    placeholder={t("Evaluation Type")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                  <textarea
                    {...register(`evaluations.${index}.description` as const)}
                    placeholder={t("Description")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                  <textarea
                    {...register(`evaluations.${index}.plan` as const)}
                    placeholder={t("Plan")}
                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isLightMode
                      ? "bg-dark  placeholder:text-tdark "
                      : "bg-secondary"
                      }  outline-none border-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeEvaluation(index); // Remove the specific evaluation
                    reset(getValues()); // Reset the form to update the state
                  }}
                  className="text-twhite bg-red-500 font-bold  px-4 py-2 shadow-md rounded-md"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-slate-600  rounded-lg font-bold hover:bg-slate-700 transition duration-200
            
            
            ${isLightMode ? " text-tblackAF" : "text-twhite"}
            
            ${isPendingEmployee ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isPendingEmployee}
          >
            {
              <PendingLogic
                isPending={isPendingEmployee}
                normalText={
                  employeeData ? "Update Employee" : "Create Employee"
                }
                pendingText={employeeData ? "Updating..." : "Creating..."}
              />
            }
          </button>
        </form>
      </div>
    </GridContainer>
  );
};

export default AddEmp;

interface FileUploadProps {
  index: number;
  fieldName: string;
  fileNames: Record<string, Record<string, string>>;
  setFileNames: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLightMode: boolean;
  setValue: UseFormSetValue<EmployeeFormInputs>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  index,
  fileNames,
  setFileNames,
  handleFileChange,
  isLightMode,
  fieldName,
  setValue,
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Pass the event to parent handler
      handleFileChange(e);

      // Update file names state
      setFileNames((prev) => ({
        ...prev,
        [fieldName]: {
          ...(prev[fieldName] || {}),
          [index]: file.name,
        },
      }));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset upload state after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("File upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent opening file dialog

    // Update the file names state by removing this file
    setFileNames((prev) => {
      const newState = { ...prev };
      if (newState[fieldName] && newState[fieldName][index]) {
        delete newState[fieldName][index];
      }
      return newState;
    });

    // Clear the file input
    const fileInput = document.getElementById(
      `fileInput-${fieldName}-${index}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    // Set the file to null in the form state - this is key for updates
    setValue(`${fieldName}.${index}.file`, "");
  };

  const fileName = fileNames[fieldName]?.[index];

  return (
    <div className="mt-2">
      {isUploading ? (
        <div
          className={`w-full px-4 py-3 rounded-lg ${isLightMode
            ? "bg-dark border border-blue-400"
            : "bg-secondary border border-blue-600"
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs ${isLightMode ? "text-blue-600" : "text-blue-400"
                }`}
            >
              {t("Uploading file...")}
            </span>
            <span
              className={`text-xs ${isLightMode ? "text-blue-600" : "text-blue-400"
                }`}
            >
              {uploadProgress}%
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full ${isLightMode ? "bg-gray-200" : "bg-gray-700"
              }`}
          >
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full px-4 py-3 rounded-lg border ${fileName ? "border-solid" : "border-dashed border-3"
            } 
            ${fileName
              ? isLightMode
                ? "border-green-400 bg-green-50"
                : "border-green-700 bg-green-900/20"
              : isLightMode
                ? "border-gray-300 bg-gray-50"
                : "border-gray-700 bg-main"
            } 
            flex items-center cursor-pointer transition-colors hover:${isLightMode ? "bg-gray-100" : "bg-gray-700/30"
            }`}
          onClick={() =>
            document.getElementById(`fileInput-${fieldName}-${index}`)?.click()
          }
        >
          {fileName ? (
            <>
              <svg
                className={`w-4 h-4 mx-2 ${isLightMode ? "text-green-500" : "text-green-400"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span
                className={`text-sm truncate flex-1 ${isLightMode ? "text-gray-700" : "text-gray-300"
                  }`}
              >
                {fileName.substring(fileName.lastIndexOf("/") + 1)}
              </span>
              {/* Clear file button */}
              <button
                type="button"
                onClick={handleClearFile}
                className={`ml-2 p-1 rounded-full ${isLightMode
                  ? "text-red-500 hover:bg-red-50"
                  : "text-red-400 hover:bg-red-900/20"
                  }`}
                title={t("Remove file")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </>
          ) : (
            <>
              <svg
                className={`w-4 h-4 mx-2 ${isLightMode ? "text-gray-400" : "text-gray-500"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span
                className={`text-sm ${isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {t("Click to upload file")}
              </span>
            </>
          )}
        </div>
      )}

      <input
        id={`fileInput-${fieldName}-${index}`}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
