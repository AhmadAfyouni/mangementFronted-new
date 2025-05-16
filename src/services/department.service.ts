/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DepartmentFormInputs,
  HandleManualSubmitOptions,
} from "@/types/DepartmentType.type";
import { Dispatch, SetStateAction } from "react";
import { UseFormSetValue } from "react-hook-form";

export const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedFiles: Dispatch<SetStateAction<File[]>>
) => {
  const files = event.target.files;
  if (files) {
    const newFiles = Array.from(files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }
};

export const handleRemoveFile = (
  index: number,
  setSelectedFiles: Dispatch<SetStateAction<File[]>>
) => {
  setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
};

export const handleAddNumericOwner = (
  appendNumericOwner: (value: { category: string; count: number }) => void
) => {
  appendNumericOwner({ category: "", count: 1 });
};

export const handleAddCategory = (
  newCategory: string,
  setNewCategory: Dispatch<SetStateAction<string>>,
  setRequiredCategoryOptions: Dispatch<SetStateAction<string[]>>,
  setIsAddingCategory: Dispatch<SetStateAction<boolean>>,
  setValue: UseFormSetValue<DepartmentFormInputs>
) => {
  if (newCategory.trim() !== "") {
    setRequiredCategoryOptions((prevOptions) => [...prevOptions, newCategory]);
    setValue("category", newCategory);
    setIsAddingCategory(false);
    setNewCategory("");
  }
};

export const handleManualSubmit = async ({
  getValues,
  addDepartment,
}: HandleManualSubmitOptions) => {
  const data = getValues();

  const formattedNumericOwners =
    data.numericOwners?.map((owner) => ({
      ...owner,
      count: parseInt(owner.count + "", 10),
    })) || [];

  // Ensure supporting files are processed correctly
  const formData = {
    ...data,
    numericOwners: formattedNumericOwners,
    // Ensure these are all urls
    supportingFiles: data.supportingFiles || [],
    requiredReports: data.requiredReports?.map(report => ({
      name: report.name,
      templateFile: report.templateFile // This should be the public URL
    })) || [],
    developmentPrograms: data.developmentPrograms?.map(program => ({
      programName: program.programName,
      objective: program.objective,
      notes: program.notes || "",
      programFile: program.programFile // This should be the public URL
    })) || []
  };

  console.log("Department form data being submitted:", formData);

  addDepartment(formData);
};
