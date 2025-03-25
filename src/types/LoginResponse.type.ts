export type UserType = {
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
  legal_documents: {
    name: string;
    validity: string;
    file: string;
  }[];
  certifications: {
    certificate_name: string;
    date: string;
    grade: string;
    file: string;
  }[];
  employment_date: string;
  department: {
    name: string;
    id: string;
  };
  job: {
    id: string;
    name: string;
    title: string;
    grade_level: string;
    description: string;
    responsibilities: string[];
    permissions: string[];
    accessibleDepartments: string[];
    is_manager: boolean;
    category: {
      id: string;
      description: string;
      name: string;
      required_education: string;
      required_skills: string[];
      required_experience: string;
    };
  };
  job_tasks: string;
  base_salary: number;
  allowances: {
    allowance_type: string;
    amount: number;
  }[];
  incentives: {
    description: string;
    amount: number;
  }[];
  bank_accounts: {
    bank_name: string;
    account_number: string;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluations: any[];
};

export type LoginResponse = {
  status: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  role: "admin" | "primary_user" | "secondary_user";
  user: UserType;
};
