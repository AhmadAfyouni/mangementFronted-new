import * as yup from "yup";

export const addDeptSchema = yup.object().shape({
  name: yup.string().required("Department name is required"),
  description: yup.string().optional(),
  goal: yup.string().required("Goal is required"),
  category: yup.string().required("Category is required"),
  mainTasks: yup.string().required("Main tasks are required"),
  parent_department_id: yup
    .string()
    .required("Parent Department Id is Required"),
  numericOwners: yup.array().of(
    yup.object().shape({
      category: yup.string(),
      count: yup.number(),
    })
  ),
  supportingFiles: yup.array().of(yup.mixed()).notRequired(),
  requiredReports: yup.array().of(
    yup.object().shape({
      name: yup.string(),
      templateFile: yup.string().optional(),
    })
  ),
  developmentPrograms: yup.array().of(
    yup.object().shape({
      programName: yup.string(),
      objective: yup.string(),
      notes: yup.string(),
      programFile: yup.string().optional(),
    })
  ),
});

export const addDeptPopupSchema = yup.object().shape({
  name: yup.string().required("Department name is required"),
  description: yup.string().required("Description is required"),
  parent_department_id: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .default(undefined),
});
