import * as yup from "yup";

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
});
