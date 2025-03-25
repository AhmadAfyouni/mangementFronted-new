import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LegalDocument {
  name: string;
  validity: string;
  file: string;
}

export interface Certification {
  certificate_name: string;
  date: string;
  grade: string;
  file: string;
}

interface Allowance {
  allowance_type: string;
  amount: number;
}

interface Incentive {
  description: string;
  amount: number;
}

interface BankAccount {
  bank_name: string;
  account_number: string;
}

interface Category {
  id: string;
  description: string;
  name: string;
  required_education: string;
  required_skills: string[];
  required_experience: string;
}

interface Job {
  id: string;
  name: string;
  title: string;
  grade_level: string;
  description: string;
  responsibilities: string[];
  permissions: string[];
  accessibleDepartments: string[];
  is_manager: boolean;
  department: string;
  category: Category;
}

interface Department {
  name: string;
  id: string;
}

export interface EmployeeType {
  id: string;
  name: string;
  national_id: string;
  dob: string;
  gender: string;
  marital_status: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  legal_documents: LegalDocument[];
  certifications: Certification[];
  employment_date: string;
  department?: Department;
  job: Job;
  job_tasks: string;
  base_salary: number;
  allowances: Allowance[];
  incentives: Incentive[];
  bank_accounts: BankAccount[];
  evaluations: any[];
}

export interface EmployeeFormInputs {
  id?: string;
  name: string;
  national_id: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  gender: string;
  marital_status: string;
  address: string;
  employment_date: string;
  base_salary: number;
  emergency_contact: string;

  department_id: string;
  job_id: string;
  job_tasks: string;
  legal_documents: { name: string; validity: string; file: string | null }[];
  certifications: {
    certificate_name: string;
    date: string;
    grade: string;
    file: string | null;
  }[];
  allowances: { allowance_type: string; amount: number }[];
  incentives: { description: string; amount: number }[];
  bank_accounts: { bank_name: string; account_number: string }[];
  evaluations: { evaluation_type: string; description: string; plan: string }[];
}

export interface CreateEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData?: EmployeeFormInputs | null;
}

export interface SnackbarConfig {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

export interface HandleSubmitOptions {
  data: EmployeeFormInputs;
  addEmployee: (data: EmployeeFormInputs) => void;
}

export interface HandleDeleteEmployeeClick {
  id: string;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<EmployeeType[], Error>>;
}
