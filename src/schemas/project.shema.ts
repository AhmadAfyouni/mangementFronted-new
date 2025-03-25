import * as yup from "yup";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const addProjectSchema = (isEditing = false) => {
  return yup.object({
    name: yup.string().required("Project name is required"),
    description: yup.string().required("Description is required"),
    departments: yup.array().of(yup.string()).nullable(),
    members: yup.array().of(yup.string()).nullable(),
    startDate: yup
      .date()
      .required("Start date is required")
      .transform((value, originalValue) => {
        if (!originalValue) return null;
        const date = new Date(originalValue);
        return date;
      })
      .test("start-date", "Due date cannot be in the past", function (value) {
        if (isEditing) return true;
        return value ? value >= today : false;
      }),
    endDate: yup
      .date()
      .required("End date is required")
      .transform((value, originalValue) => {
        if (!originalValue) return null;
        const date = new Date(originalValue);
        return date;
      })
      .min(today, "Due date cannot be in the past"),
  });
};
