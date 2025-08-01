import * as yup from "yup";

export const addSectionSchema = yup.object().shape({
    name: yup.string().required("Section name is required"),
    department: yup.string().required("Department is required"),
    type_section: yup.string().oneOf(["BY_ME", "FOR_ME"]).required("Section type is required"),
    emp: yup.string().when("type_section", {
        is: "BY_ME",
        then: (schema) => schema.required("Employee is required for BY_ME sections"),
        otherwise: (schema) => schema.optional(),
    }),
});

export const updateSectionSchema = yup.object().shape({
    name: yup.string().required("Section name is required"),
    department: yup.string().required("Department is required"),
    type_section: yup.string().oneOf(["BY_ME", "FOR_ME"]).required("Section type is required"),
    emp: yup.string().when("type_section", {
        is: "BY_ME",
        then: (schema) => schema.required("Employee is required for BY_ME sections"),
        otherwise: (schema) => schema.optional(),
    }),
}); 