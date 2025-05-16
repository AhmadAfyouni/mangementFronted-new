/* eslint-disable @typescript-eslint/no-explicit-any */
import { XIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { FileManager } from '@/components/common/atoms/fileManager';
import { useFileUpload } from '@/hooks/fileManager';
import { DepartmentFormInputs } from "@/types/DepartmentType.type";
import { FileObject } from "./DeptAdditionalSection.d";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UseFormGetValues, UseFormRegister } from "react-hook-form";
import useSnackbar from "@/hooks/useSnackbar";
import FileUploadService from "@/services/fileUpload.service";

interface DeptAdditionalSectionProps {
  register: UseFormRegister<DepartmentFormInputs>;
  errors: Record<string, any>;
  numericOwnersFields: { id: string; category: string; count: number }[];
  availableCategories: string[];
  handleAddNumericOwner: (callback: (value: any) => void) => void;
  appendNumericOwner: (value: any) => void;
  removeNumericOwner: (index: number) => void;
  requiredReportsFields: { id: string; name: string; templateFile: string }[];
  appendRequiredReport: (value: any) => void;
  removeRequiredReport: (index: number) => void;
  getValues: UseFormGetValues<DepartmentFormInputs>;
  developmentProgramsFields: {
    id: string;
    name: string;
    programFile: string;
    objective: string;
    notes: string;
  }[];
  appendDevelopmentProgram: (value: any) => void;
  removeDevelopmentProgram: (index: number) => void;
  setValue: (name: string, value: any) => void;
  departmentId?: string; // Added departmentId prop for existing departments
}

// Type for file item editing mode
interface FileEditMode {
  [key: number]: boolean;
}

const DeptAdditionalSection = ({
  requiredReportsFields,
  developmentProgramsFields,
  errors,
  numericOwnersFields,
  availableCategories,
  register,
  handleAddNumericOwner,
  appendNumericOwner,
  removeNumericOwner,
  appendRequiredReport,
  removeRequiredReport,
  appendDevelopmentProgram,
  removeDevelopmentProgram,
  setValue,
  getValues,
  departmentId,
}: DeptAdditionalSectionProps) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { setSnackbarConfig } = useSnackbar();
  const [supportingFileUrls, setSupportingFileUrls] = useState<string[]>([]);

  // Track edit mode for each file type
  const [reportEditMode, setReportEditMode] = useState<FileEditMode>({});
  const [programEditMode, setProgramEditMode] = useState<FileEditMode>({});

  // Loading states
  const [loadingReportIndex, setLoadingReportIndex] = useState<number | null>(null);
  const [loadingProgramIndex, setLoadingProgramIndex] = useState<number | null>(null);

  // Use refs to track previous field lengths to prevent unnecessary updates
  const prevReportsLength = useRef(requiredReportsFields.length);
  const prevProgramsLength = useRef(developmentProgramsFields.length);

  // Initialize supporting files from form values
  useEffect(() => {
    try {
      // Make sure we're getting the array of URLs
      const savedFiles = getValues("supportingFiles") || [];
      console.log('Initializing supporting files from form:', savedFiles);
      
      if (Array.isArray(savedFiles)) {
        setSupportingFileUrls(savedFiles);
      } else {
        console.error('Supporting files is not an array:', savedFiles);
        setSupportingFileUrls([]);
      }
    } catch (error) {
      console.error("Error initializing supporting files:", error);
      setSupportingFileUrls([]);
    }
  }, [getValues]);

  // Reset edit modes when fields change - only initialize new fields
  useEffect(() => {
    // Only update if the array length changed (adding/removing fields)
    if (requiredReportsFields.length !== prevReportsLength.current) {
      const newReportEditMode = { ...reportEditMode };
      
      // Set edit mode only for new fields
      if (requiredReportsFields.length > prevReportsLength.current) {
        // Initialize new fields only
        for (let i = prevReportsLength.current; i < requiredReportsFields.length; i++) {
          const field = requiredReportsFields[i];
          newReportEditMode[i] = !field.templateFile;
        }
      }
      
      setReportEditMode(newReportEditMode);
      prevReportsLength.current = requiredReportsFields.length;
    }
  }, [requiredReportsFields.length]);

  useEffect(() => {
    // Only update if the array length changed (adding/removing fields)
    if (developmentProgramsFields.length !== prevProgramsLength.current) {
      const newProgramEditMode = { ...programEditMode };
      
      // Set edit mode only for new fields
      if (developmentProgramsFields.length > prevProgramsLength.current) {
        // Initialize new fields only
        for (let i = prevProgramsLength.current; i < developmentProgramsFields.length; i++) {
          const field = developmentProgramsFields[i];
          newProgramEditMode[i] = !field.programFile;
        }
      }
      
      setProgramEditMode(newProgramEditMode);
      prevProgramsLength.current = developmentProgramsFields.length;
    }
  }, [developmentProgramsFields.length]);

  // Function to process file URL for display
  const processPublicUrl = (fileUrl: string) => {
    // Extract filename from URL
    try {
      if (!fileUrl) return "";
      
      // Handle both absolute URLs and relative paths
      if (fileUrl.includes("/public-files/departments/")) {
        return fileUrl.split("/public-files/departments/")[1].split("?")[0];
      }
      if (fileUrl.includes("/departments/")) {
        return fileUrl.split("/departments/")[1].split("?")[0];
      }
      return fileUrl.split("/").pop()?.split("?")[0] || fileUrl;
    } catch (e) {
      console.log("Error processing URL:", e);
      return fileUrl;
    }
  };

  // Function to check if string is a valid URL or valid file path
  const isValidUrl = (urlString: string) => {
    try {
      if (!urlString) return false;
      
      // Check for absolute URLs
      if (urlString.includes("http")) return true;
      
      // Check for relative file paths
      if (urlString.startsWith("/public-files/") || urlString.includes("/departments/")) {
        return true;
      }
      
      return false;
    } catch (e) {
      console.log("Error checking URL:", e);
      return false;
    }
  };

  // Mode switching functions
  const switchReportToEditMode = (index: number) => {
    setValue(`requiredReports.${index}.templateFile`, "");
    setReportEditMode((prev) => ({ ...prev, [index]: true }));
  };

  const switchProgramToEditMode = (index: number) => {
    setValue(`developmentPrograms.${index}.programFile`, "");
    setProgramEditMode((prev) => ({ ...prev, [index]: true }));
  };

  // Handler for file upload - only cares about storing the URL correctly
  const handleSupportingFileUpload = async (input: React.ChangeEvent<HTMLInputElement> | string) => {
    // If called from FileManager component with fileUrl directly
    if (typeof input === 'string') {
      // Make sure we're storing the public URL
      const newUrls = [...supportingFileUrls, input];
      console.log('Adding URL from FileManager:', input);
      setSupportingFileUrls(newUrls);
      setValue("supportingFiles", newUrls);
      return;
    }

    // If called from file input
    if (input.target?.files?.length) {
      const file = input.target.files[0];
      if (file) {
        try {
          // Upload file directly and get the public URL
          const publicUrl = await handleDirectFileUpload(file, `Supporting file for department`);
          console.log('Supporting file uploaded, adding URL:', publicUrl);
          
          // Store the public URL in both state and form value
          const newUrls = [...supportingFileUrls, publicUrl];
          setSupportingFileUrls(newUrls);
          setValue("supportingFiles", newUrls);
          
          // Reset the file input
          input.target.value = '';
        } catch (error) {
          console.error('Error uploading supporting file:', error);
          setSnackbarConfig({
            open: true,
            message: t('Error uploading file'),
            severity: 'error'
          });
        }
      }
    }
  };

  // Function to remove a supporting file
  const removeSupportingFile = (index: number) => {
    const newUrls = [...supportingFileUrls];
    newUrls.splice(index, 1);
    setSupportingFileUrls(newUrls);
    setValue("supportingFiles", newUrls);
  };

  const { uploadFileAsync } = useFileUpload();

  // Using direct file upload for files when creating a new department
  const handleDirectFileUpload = async (file: File, description: string) => {
    try {
      // Use the file upload service directly instead of the entity-based upload
      const fileUrl = await FileUploadService.uploadSingleFile(
        { file, name: file.name },
        'departments'
      );
      console.log('File uploaded successfully with URL:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbarConfig({
        open: true,
        message: t('Error uploading file'),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingReportIndex(index);
      try {
        let fileUrl;
        
        if (departmentId && departmentId !== 'new') {
          // If we have a department ID, use the regular file upload through the API
          const result = await uploadFileAsync({
            file,
            entityType: 'department',
            entityId: departmentId,
            fileType: 'template',
            description: `Template for ${requiredReportsFields[index].name}`,
            name: file.name
          });
          
          // Extract the public URL from the result
          fileUrl = result.data.fileUrl;
          console.log('Report file uploaded through API, URL:', fileUrl);
        } else {
          // For new department, use direct file upload to get public URL
          fileUrl = await handleDirectFileUpload(file, `Template for ${requiredReportsFields[index].name}`);
          console.log('Report file uploaded directly, URL:', fileUrl);
        }

        // Store the URL in the form
        setValue(`requiredReports.${index}.templateFile`, fileUrl);
        setReportEditMode((prev) => ({ ...prev, [index]: false }));
      } catch (error) {
        console.error('Error uploading report file:', error);
        setSnackbarConfig({
          open: true,
          message: t('Error uploading file'),
          severity: 'error'
        });
      } finally {
        setLoadingReportIndex(null);
      }
    }
  };

  const handleProgramFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingProgramIndex(index);
      try {
        let fileUrl;
        
        if (departmentId && departmentId !== 'new') {
          // If we have a department ID, use the regular file upload through the API
          const result = await uploadFileAsync({
            file,
            entityType: 'department',
            entityId: departmentId,
            fileType: 'program',
            description: `Program for ${developmentProgramsFields[index].name || 'Development Program'}`,
            name: file.name
          });
          
          // Extract the public URL from the result
          fileUrl = result.data.fileUrl;
          console.log('Program file uploaded through API, URL:', fileUrl);
        } else {
          // For new department, use direct file upload to get public URL
          fileUrl = await handleDirectFileUpload(file, `Program for ${developmentProgramsFields[index].name || 'Development Program'}`);
          console.log('Program file uploaded directly, URL:', fileUrl);
        }

        // Store the URL in the form
        setValue(`developmentPrograms.${index}.programFile`, fileUrl);
        setProgramEditMode((prev) => ({ ...prev, [index]: false }));
      } catch (error) {
        console.error('Error uploading program file:', error);
        setSnackbarConfig({
          open: true,
          message: t('Error uploading file'),
          severity: 'error'
        });
      } finally {
        setLoadingProgramIndex(null);
      }
    }
  };

  // Function to determine if a field should be in edit mode
  const isInReportEditMode = (index: number, templateFile: string) => {
    return reportEditMode[index] === true || !isValidUrl(templateFile);
  };

  const isInProgramEditMode = (index: number, programFile: string) => {
    return programEditMode[index] === true || !isValidUrl(programFile);
  };

  // Function to handle opening a file
  const handleOpenFile = (fileUrl: string) => {
    if (!fileUrl) return;
    
    try {
      // Determine if URL needs the base URL prepended
      let fullUrl = fileUrl;
      
      // If it's a relative path, prepend the base URL
      if (fileUrl.startsWith('/public-files/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://168.231.110.121:8011';
        fullUrl = `${baseUrl}${fileUrl}`;
      }
      
      // Open in a new tab
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
      setSnackbarConfig({
        open: true,
        message: t('Error opening file'),
        severity: 'error'
      });
    }
  };

  return (
    <>
      <div>
        <label className="text-tmid block text-sm font-medium">
          {t("Numeric Owners")}
        </label>
        {numericOwnersFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-center">
            <select
              {...register(`numericOwners.${index}.category` as const)}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                } w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border ${errors.numericOwners?.[index]?.category
                  ? "border-high"
                  : "border-border"
                }`}
            >
              <option value="">{t("Select a Job Category")}</option>
              {availableCategories.map((category, i) => (
                <option
                  key={i}
                  value={category}
                  onClick={() => handleAddNumericOwner(appendNumericOwner)}
                >
                  {category}
                </option>
              ))}
            </select>
            {errors.numericOwners?.[index]?.category && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.numericOwners?.[index]?.category?.message}
              </p>
            )}
            <input
              type="number"
              {...register(`numericOwners.${index}.count` as const, {
                valueAsNumber: true,
              })}
              placeholder={t("Count")}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border `}
            />
            <Image
              src={XIcon}
              alt="icon"
              width={30}
              height={30}
              className=" bg-main cursor-pointer p-1 shadow-md rounded-md text-red-500"
              onClick={() => removeNumericOwner(index)} // Remove numeric owner
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendNumericOwner({ count: 1, category: "" })}
          className="text-sm text-tbright underline"
        >
          {t("Add Numeric Owner")}
        </button>
      </div>

      {/* Supporting Files Section */}
      <div className="mb-6">
        <label className="text-tmid block text-sm font-medium mb-2">
          {t("Supporting Files")}
        </label>
        {departmentId && departmentId !== 'new' ? (
          <FileManager
            entityType="department"
            entityId={departmentId}
            fileType="supporting"
            title={t("Supporting Files")}
            onUploadComplete={(_, fileUrl) => handleSupportingFileUpload(fileUrl)}
          />
        ) : (
          <div className="mt-2">
            <div className="flex gap-4 items-center mb-2">
              <input
                type="file"
                className={`${isLightMode
                  ? "bg-dark  placeholder:text-tdark "
                  : "bg-secondary"
                  }  w-full  bg-secondary border-none outline-none  px-4 py-2 rounded-lg border`}
                onChange={handleSupportingFileUpload}
              />
            </div>
            
            {/* Display already uploaded supporting files */}
            {supportingFileUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">{t("Uploaded Files")}</h4>
                <div className="space-y-2">
                  {supportingFileUrls.map((fileUrl, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg ${isLightMode ? 'bg-dark text-white' : 'bg-main text-white'}`}
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="truncate max-w-xs">{processPublicUrl(fileUrl)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSupportingFile(index)}
                        className="ml-2 p-1 rounded-full hover:bg-red-600 transition-colors"
                        title={t("Remove file")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required Reports Section */}
      <div>
        <label className="text-tmid block text-sm font-medium">
          {t("Required Reports")}
        </label>
        {requiredReportsFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-center">
            <input
              type="text"
              {...register(`requiredReports.${index}.name` as const)}
              placeholder={t("Report Name")}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border `}
            />
            <div className="relative w-full">
              {!isInReportEditMode(index, field.templateFile) ? (
                // Show open file button with edit option
                <div className="flex">
                  <div
                    className={`${isLightMode
                      ? "bg-dark text-white"
                      : "bg-secondary text-white"
                      } px-4 py-2 mt-1 rounded-l-lg flex-1 text-left flex items-center cursor-pointer`}
                    onClick={() => handleOpenFile(field.templateFile)}
                  >
                    <span className="truncate">
                      {processPublicUrl(field.templateFile)}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchReportToEditMode(index)}
                    className={`${isLightMode
                      ? "bg-red-500 text-white"
                      : "bg-red-600 text-white"
                      } px-3 py-2 mt-1 rounded-r-lg`}
                    title={t("Replace file")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                // Show file input when in edit mode or no file exists
                <input
                  type="file"
                  placeholder={t("Template File")}
                  className={`    ${isLightMode
                    ? "bg-dark  placeholder:text-tdark "
                    : "bg-secondary"
                    }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border ${loadingReportIndex === index ? "opacity-50" : ""
                    }`}
                  disabled={loadingReportIndex === index}
                  onChange={(e) => handleReportFileChange(e, index)}
                />
              )}
              {loadingReportIndex === index && (
                <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                </div>
              )}
            </div>
            <Image
              src={XIcon}
              alt="icon"
              width={30}
              height={30}
              className=" bg-main cursor-pointer p-1 shadow-md rounded-md text-red-500"
              onClick={() => removeRequiredReport(index)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendRequiredReport({ name: "", templateFile: "" })}
          className="text-sm text-tbright underline"
        >
          {t("Add Required Report")}
        </button>
      </div>

      {/* Development Programs Section */}
      <div>
        <label className="text-tmid block text-sm font-medium">
          {t("Development Programs")}
        </label>
        {developmentProgramsFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-center">
            <input
              type="text"
              {...register(`developmentPrograms.${index}.programName` as const)}
              placeholder={t("Program Name")}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border `}
            />
            <input
              type="text"
              {...register(`developmentPrograms.${index}.objective` as const)}
              placeholder={t("Objective")}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                } w-full bg-secondary border-none outline-none px-4 py-2 mt-1 rounded-lg border `}
            />

            <div className="relative w-full">
              {!isInProgramEditMode(index, field.programFile) ? (
                // Show open file button with edit option
                <div className="flex">
                  <div
                    className={`${isLightMode
                      ? "bg-dark text-white"
                      : "bg-secondary text-white"
                      } px-4 py-2 mt-1 rounded-l-lg flex-1 text-left flex items-center cursor-pointer`}
                    onClick={() => handleOpenFile(field.programFile)}
                  >
                    <span className="truncate">
                      {processPublicUrl(field.programFile)}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchProgramToEditMode(index)}
                    className={`${isLightMode
                      ? "bg-red-500 text-white"
                      : "bg-red-600 text-white"
                      } px-3 py-2 mt-1 rounded-r-lg`}
                    title={t("Replace file")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                // Show file input when in edit mode or no file exists
                <input
                  type="file"
                  placeholder={t("Program File")}
                  className={`    ${isLightMode
                    ? "bg-dark  placeholder:text-tdark "
                    : "bg-secondary"
                    }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border ${loadingProgramIndex === index ? "opacity-50" : ""
                    }`}
                  disabled={loadingProgramIndex === index}
                  onChange={(e) => handleProgramFileChange(e, index)}
                />
              )}
              {loadingProgramIndex === index && (
                <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                </div>
              )}
            </div>

            <textarea
              {...register(`developmentPrograms.${index}.notes` as const)}
              placeholder={t("Notes")}
              className={`    ${isLightMode
                ? "bg-dark  placeholder:text-tdark "
                : "bg-secondary"
                }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg border `}
              rows={1}
            />
            <Image
              src={XIcon}
              alt="icon"
              width={30}
              height={30}
              className=" bg-main cursor-pointer p-1 shadow-md rounded-md text-red-500"
              onClick={() => removeDevelopmentProgram(index)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendDevelopmentProgram({
              programName: "",
              objective: "",
              notes: "",
              programFile: "",
            })
          }
          className="text-sm text-tbright underline"
        >
          {t("Add Development Program")}
        </button>
      </div>
    </>
  );
};

export default DeptAdditionalSection;