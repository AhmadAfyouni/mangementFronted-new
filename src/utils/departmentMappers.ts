import { DepartmentFormInputs, DepartmentType, FileData } from "@/types/DepartmentType.type";

/**
 * Maps the API response department data to the form structure
 * @param department Department data from API
 * @returns Formatted department data for the form
 */
/**
* Extract file URL from either a direct URL string or a file object with currentVersion
* @param fileData The file data from API
* @returns The public URL of the file
*/
const extractFileUrl = (fileData: FileData): string => {
  if (!fileData) return "";

  // If it's a string, return it directly
  if (typeof fileData === 'string') return fileData;

  // If it's an object with currentVersion, get the URL from it
  if (fileData?.currentVersion?.fileUrl) {
    return fileData.currentVersion.fileUrl;
  }

  // If it has a fileUrl property directly
  if (fileData?.currentVersion.fileUrl) {
    return fileData.currentVersion.fileUrl;
  }

  return "";
};

/**
* Maps the API response department data to the form structure
* @param department Department data from API
* @returns Formatted department data for the form
*/
export const mapDepartmentToFormInputs = (department: DepartmentType): DepartmentFormInputs => {
  return {
    id: department.id,
    name: department.name,
    description: department.mainTasks || "", // Using mainTasks as description if available
    goal: department.goal || "",
    category: department.category || "",
    mainTasks: department.mainTasks || "",
    parent_department_id: department.parent_department?.id || undefined,
    numericOwners: department.numericOwners || [],
    supportingFiles: department.supportingFiles || [],

    // Map required reports with their file URLs from templateFileId
    requiredReports: department.requiredReports?.map(report => ({
      name: report.name,
      templateFile: extractFileUrl(report.templateFileId)
    })) || [],

    // Map development programs with their file URLs from programFileId
    developmentPrograms: department.developmentPrograms?.map(program => ({
      programName: program.programName,
      objective: program.objective,
      notes: program.notes,
      programFile: extractFileUrl(program.programFileId)
    })) || []
  };
};

/**
 * Maps the form input data to the API request structure
 * @param formData Form data from react-hook-form
 * @returns Formatted data for API request
 */
export const mapFormInputsToDepartmentRequest = (formData: DepartmentFormInputs) => {
  return {
    id: formData.id,
    name: formData.name,
    description: formData.description,
    goal: formData.goal,
    category: formData.category,
    mainTasks: formData.mainTasks,
    parent_department_id: formData.parent_department_id || null,
    numericOwners: formData.numericOwners || [],
    supportingFiles: formData.supportingFiles || [],
    requiredReports: formData.requiredReports.map(report => ({
      name: report.name,
      templateFile: report.templateFile
    })),
    developmentPrograms: formData.developmentPrograms.map(program => ({
      programName: program.programName,
      objective: program.objective,
      notes: program.notes || "",
      programFile: program.programFile
    }))
  };
};
