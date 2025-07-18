"use client";

import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useQueryPageData from "@/hooks/useQueryPageData";
import { addEmpSchema } from "@/schemas/employee.schema";
import { DepartmentType } from "@/types/DepartmentType.type";
import { EmployeeFormInputs } from "@/types/EmployeeType.type";
import { JobTitleType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import { ArrowLeft, Briefcase, DollarSign, FileText, Loader2, Plus, Star, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldValues, Resolver, useFieldArray, useForm, UseFormReset, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CompensationSection,
  DocumentsSection,
  EmploymentInfoSection,
  EvaluationSection,
  PersonalInfoSection,
} from "./components";
import { ApiJobTitle } from "./components/EmploymentInfoSection";

const EmployeePageHeader: React.FC<{
  t: (key: string) => string;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
  isUpdate: boolean;
}> = ({ t, onCancel, onSubmit, isPending, isUpdate }) => (
  <div className="">
    <div className="max-w-7xl mx-auto  ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            type="button"
            className="p-2 hover:bg-dark/50 rounded-lg transition-colors text-gray-400 hover:text-twhite"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-600/20">
              <FileText className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-twhite">
                {isUpdate ? t("Update Employee") : t("Create New Employee")}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t("Fill in the details to create a new employee")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={isPending}
            type="button"
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t(isUpdate ? "Updating..." : "Creating...")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t(isUpdate ? "Update Employee" : "Create Employee")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  count,
  iconBgColor = "bg-purple-600/20",
  iconTextColor = "text-purple-400",
  className = "",
}) => {
  return (
    <div className={clsx("bg-secondary rounded-2xl shadow-xl border border-gray-700 overflow-hidden", className)}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-dark/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <div className={`w-5 h-5 ${iconTextColor}`}>{icon}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-twhite">{title}</h3>
            {count !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2.5 py-1 rounded-full font-medium">
                  {count} {count === 1 ? 'field' : 'fields'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-lg transition-all duration-200 ${isOpen ? `${iconBgColor} bg-opacity-20   rotate-180` : 'bg-gray-700/50'}`}>
          <svg
            className={`w-5 h-5 transition-colors ${isOpen ? iconTextColor : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-700">
          <div className="p-5">{children}</div>
        </div>
      )}
    </div>
  );
};

const AddEmployeeCollapsible: React.FC = () => {
  const { setSnackbarConfig } = useMokkBar();
  const router = useRouter();
  const { isLightMode } = useCustomTheme();
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState({
    personal: true,
    employment: false,
    documents: false,
    compensation: false,
    evaluation: false,
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
    resolver: yupResolver(addEmpSchema) as unknown as Resolver<EmployeeFormInputs>,
    defaultValues: {},
  });

  const employeeData = useQueryPageData<EmployeeFormInputs>(reset as unknown as UseFormReset<FieldValues>);

  // Field arrays
  const legalDocumentArray = useFieldArray({ control, name: "legal_documents" });
  const certificationArray = useFieldArray({ control, name: "certifications" });
  const allowancesArray = useFieldArray({ control, name: "allowances" });
  const incentivesArray = useFieldArray({ control, name: "incentives" });
  const bankAccountsArray = useFieldArray({ control, name: "bank_accounts" });
  const evaluationsArray = useFieldArray({ control, name: "evaluations" });

  // Data queries
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
    nestedData: true,
  });

  const endpoint = employeeData
    ? `/emp/update/${employeeData.id}`
    : `/emp/create`;

  const { mutate: addEmployee, isPending: isPendingEmployee } =
    useCreateMutation<EmployeeFormInputs>({
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
    // You may want to filter/format data here
    addEmployee(data);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCancel = () => router.back();

  return (
    <div className="flex justify-center w-full min-h-screen bg-main">
      <div className="w-full max-w-7xl px-4 sm:px-8 py-8">
        <EmployeePageHeader
          t={t}
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          isPending={isPendingEmployee}
          isUpdate={!!employeeData}
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 mt-6">
          <CollapsibleCard
            title={t("Personal Information")}
            isOpen={openSections.personal}
            onToggle={() => toggleSection("personal")}
            icon={<User className="w-5 h-5" />}
            iconBgColor="bg-purple-600/20"
            iconTextColor="text-purple-400"
          >
            <PersonalInfoSection
              register={register}
              errors={errors}
              employeeData={employeeData}
              getValues={getValues}
            />
          </CollapsibleCard>

          <CollapsibleCard
            title={t("Employment Information")}
            isOpen={openSections.employment}
            onToggle={() => toggleSection("employment")}
            icon={<Briefcase className="w-5 h-5" />}
            iconBgColor="bg-blue-600/20"
            iconTextColor="text-blue-400"
          >
            {/* Defensive: always pass defined objects/arrays to prevent TypeError */}
            <EmploymentInfoSection
              register={register}
              errors={errors}
              departments={departments ? departments : { info: [], tree: [] }}
              jobs={jobs ? (jobs as unknown as ApiJobTitle[]) : []}
              selectedDept={getValues("department_id")}
              setValue={setValue as unknown as UseFormSetValue<EmployeeFormInputs>}
              employeeData={employeeData}
              getValues={getValues}
            />
          </CollapsibleCard>

          <CollapsibleCard
            title={t("Documents")}
            isOpen={openSections.documents}
            onToggle={() => toggleSection("documents")}
            icon={<FileText className="w-5 h-5" />}
            iconBgColor="bg-green-600/20"
            iconTextColor="text-green-400"
          >
            <DocumentsSection
              legalDocumentFields={legalDocumentArray.fields}
              appendLegalDocument={legalDocumentArray.append}
              removeLegalDocument={legalDocumentArray.remove}
              certificationFields={certificationArray.fields}
              appendCertification={certificationArray.append}
              removeCertification={certificationArray.remove}
              errors={errors}
              isLightMode={isLightMode}
              setValue={setValue}
              getValues={getValues}
              reset={reset}
              register={register}
            />
          </CollapsibleCard>

          <CollapsibleCard
            title={t("Compensation & Financial")}
            isOpen={openSections.compensation}
            onToggle={() => toggleSection("compensation")}
            icon={<DollarSign className="w-5 h-5" />}
            iconBgColor="bg-yellow-600/20"
            iconTextColor="text-yellow-400"
          >
            <CompensationSection
              allowancesFields={allowancesArray.fields}
              appendAllowance={allowancesArray.append}
              removeAllowance={allowancesArray.remove}
              incentivesFields={incentivesArray.fields}
              appendIncentive={incentivesArray.append}
              removeIncentive={incentivesArray.remove}
              bankAccountsFields={bankAccountsArray.fields}
              appendBankAccount={bankAccountsArray.append}
              removeBankAccount={bankAccountsArray.remove}
              register={register}
              errors={errors}
              reset={reset}
              getValues={getValues}
            />
          </CollapsibleCard>

          <CollapsibleCard
            title={t("Performance Evaluations")}
            isOpen={openSections.evaluation}
            onToggle={() => toggleSection("evaluation")}
            icon={<Star className="w-5 h-5" />}
            iconBgColor="bg-pink-600/20"
            iconTextColor="text-pink-400"
          >
            <EvaluationSection
              evaluationsFields={evaluationsArray.fields}
              appendEvaluation={evaluationsArray.append}
              removeEvaluation={evaluationsArray.remove}
              register={register}
              errors={errors}
              reset={reset}
              getValues={getValues}
            />
          </CollapsibleCard>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeCollapsible;
