import * as yup from "yup";

export const addEmpSchema = yup.object().shape({
  id: yup.string().optional(),
  name: yup.string().required("Employee name is required"),
  national_id: yup.string().required("National Id is required"),
  gender: yup.string().required("Gender is required"),
  marital_status: yup.string().required("Marital status is required"),
  address: yup.string().required("Address is required"),
  employment_date: yup
    .string()
    .required("Employment date is required")
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Employment date must be in YYYY-MM-DD format"
    ),
  base_salary: yup.number().required("Base salary is required"),
  dob: yup
    .string()
    .required("Date of birth is required")
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in YYYY-MM-DD format"
    ),
  phone: yup.string().required("Phone number is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup.string().nullable(),

  department_id: yup.string().required("Department ID is required"),
  job_id: yup.string().required("Job ID is required"),
  job_tasks: yup.string().required("Job tasks is required"),
  emergency_contact: yup.string().required("emergency contact is required"),
  legal_documents: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("Document name is required"),
        validity: yup.string().nullable(), // No validation for date format
        file: yup.string().nullable(), // File is optional
      })
    )
    .optional(),

  certifications: yup
    .array()
    .of(
      yup.object().shape({
        certificate_name: yup.string().required("Certificate name is required"),
        date: yup.string().nullable(), // No validation for date format
        grade: yup.string().required("Grade is required"),
        file: yup.string().nullable(), // File is optional
      })
    )
    .optional(),

  allowances: yup
    .array()
    .of(
      yup.object().shape({
        allowance_type: yup.string().required("Allowance type is required"),
        amount: yup
          .number()
          .required("Allowance amount is required")
          .positive("Amount must be a positive number"),
      })
    )
    .optional(),

  incentives: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().required("Incentive description is required"),
        amount: yup
          .number()
          .required("Incentive amount is required")
          .positive("Amount must be a positive number"),
      })
    )
    .optional(),

  bank_accounts: yup
    .array()
    .of(
      yup.object().shape({
        bank_name: yup.string().required("Bank name is required"),
        account_number: yup
          .string()
          .required("Account number is required")
          .matches(/^\d+$/, "Account number must contain only digits"),
      })
    )
    .optional(),

  evaluations: yup
    .array()
    .of(
      yup.object().shape({
        evaluation_type: yup.string().required("Evaluation type is required"),
        description: yup
          .string()
          .required("Evaluation description is required"),
        plan: yup.string().required("Plan is required"),
      })
    )
    .optional(),
});

export const addEmpPopupSchema = yup.object().shape({
  name: yup.string().required("Employee name is required"),
  dob: yup
    .date()
    .required("Date of birth is required")
    .typeError("Invalid date format"),
  phone: yup.string().required("Phone number is required"),
  password: yup.string(),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  address: yup.string().required("Address is required"),
  department_id: yup.string().required("Department ID is required"),
  job_id: yup.string().required("Job ID is required"),
});
