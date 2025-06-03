import * as yup from "yup";

// Allowed values for recurring types and priorities (lowercase to match backend)
export const RECURRING_TYPES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;

// Define routine task schema
const subtaskSchema = yup.object().shape({
  name: yup.string().required("Subtask name is required"),
  description: yup.string(),
  estimatedHours: yup.number().min(0, "Hours must be positive").default(0)
});

export const routineTaskSchema = yup.object().shape({
  name: yup.string().required("Task name is required"),
  description: yup.string(),
  priority: yup.string()
    .required("Priority is required")
    .oneOf(PRIORITY_LEVELS, `Priority must be one of: ${PRIORITY_LEVELS.join(', ')}`),
  recurringType: yup.string()
    .required("Recurring type is required")
    .oneOf(RECURRING_TYPES, `Recurring type must be one of: ${RECURRING_TYPES.join(', ')}`),
  intervalDays: yup.number().min(1, "Interval must be at least 1 day").default(7),
  estimatedHours: yup.number().min(0, "Hours must be positive").default(0),
  isActive: yup.boolean().default(true),
  instructions: yup.array().of(yup.string()).default([]),
  hasSubTasks: yup.boolean().default(false),
  subTasks: yup.array().of(subtaskSchema).default([])
});

export const addCategorySchema = yup.object().shape({
  name: yup.string().required("Category name is required"),
  description: yup.string().required("Description is required"),
  required_education: yup.string().required("Required education is required"),
  required_experience: yup.string().required("Required experience is required"),
  required_skills: yup
    .array(yup.string().required("Skill is required"))
    .min(1, "At least one skill is required"),
});

export const addTitleSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  responsibilities: yup
    .array(yup.string().required("Responsibilities are required"))
    .required(),
  permissions: yup
    .array(yup.string().required("Each permission must be a string"))
    .required("Permissions are required"),

  department_id: yup.string().required("Department ID is required"),
  category: yup.string().required("Job Category is required"),
  is_manager: yup.boolean().notRequired(),
  accessibleDepartments: yup.array(yup.string()).nullable(),
  accessibleEmps: yup.array(yup.string()).nullable(),
  accessibleJobTitles: yup.array(yup.string()).nullable(),

  // Routine tasks related fields
  hasRoutineTasks: yup.boolean().default(false),
  autoGenerateRoutineTasks: yup.boolean().default(true),
  routineTasks: yup.array().of(routineTaskSchema).when('hasRoutineTasks', {
    is: true,
    then: (schema) => schema,
    otherwise: (schema) => schema.nullable(),
  }),
});
