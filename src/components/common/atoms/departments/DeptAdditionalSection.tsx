/* eslint-disable @typescript-eslint/no-explicit-any */
import { XIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { FileManager } from '@/components/common/atoms/fileManager';
import { useFileUpload } from '@/hooks/fileManager';
import { DepartmentFormInputs } from "@/types/DepartmentType.type";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UseFormGetValues, UseFormRegister } from "react-hook-form";
import useSnackbar from "@/hooks/useSnackbar";

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

  // Initialize supporting files from form values
  const files = getValues("supportingFiles") || [];
  useEffect(() => {
    try {
      setSupportingFileUrls(files);
    } catch (error) {
      console.error("Error initializing supporting files:", error);
    }
  }, [files, getValues]);

  // Reset edit modes when fields change
  useEffect(() => {
    const newReportEditMode: FileEditMode = {};
    requiredReportsFields.forEach((field, index) => {
      // If templateFile is empty or user was already in edit mode, keep in edit mode
      newReportEditMode[index] =
        !field.templateFile || reportEditMode[index] || false;
    });
    setReportEditMode(newReportEditMode);
  }, [requiredReportsFields]);

  useEffect(() => {
    const newProgramEditMode: FileEditMode = {};
    developmentProgramsFields.forEach((field, index) => {
      // If programFile is empty or user was already in edit mode, keep in edit mode
      newProgramEditMode[index] =
        !field.programFile || programEditMode[index] || false;
    });
    setProgramEditMode(newProgramEditMode);
  }, [developmentProgramsFields]);

  // Function to process file URL for display
  const processPublicUrl = (fileUrl: string) => {
    // Extract filename from URL
    try {
      if (fileUrl.includes("/departments/")) {
        return fileUrl.split("/departments/")[1].split("?")[0];
      }
      return fileUrl.split("/").pop()?.split("?")[0] || fileUrl;
    } catch (e) {
      console.log("Error processing URL:", e);
      return fileUrl;
    }
  };

  // Function to check if string is a valid URL
  const isValidUrl = (urlString: string) => {
    try {
      return Boolean(urlString && urlString.includes("http"));
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

  // Handle file upload completion for different sections
  const handleSupportingFileUpload = (fileId: string, fileUrl: string) => {
    const newUrls = [...supportingFileUrls, fileUrl];
    setSupportingFileUrls(newUrls);
    setValue("supportingFiles", newUrls);
  };

  const { uploadFileAsync } = useFileUpload();

  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingReportIndex(index);
      try {
        const result = await uploadFileAsync({
          file,
          entityType: 'department',
          entityId: departmentId || 'new',
          fileType: 'template',
          description: `Template for ${requiredReportsFields[index].name}`,
          name: file.name
        });

        setValue(`requiredReports.${index}.templateFile`, result.data.fileUrl);
        setReportEditMode((prev) => ({ ...prev, [index]: false }));
      } catch (error) {
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
        const result = await uploadFileAsync({
          file,
          entityType: 'department',
          entityId: departmentId || 'new',
          fileType: 'program',
          description: `Program for ${developmentProgramsFields[index].name}`,
          name: file.name
        });

        setValue(`developmentPrograms.${index}.programFile`, result.data.fileUrl);
        setProgramEditMode((prev) => ({ ...prev, [index]: false }));
      } catch (error) {
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

      {/* Supporting Files Section - Using the new FileManager Component */}
      {departmentId && (
        <div className="mb-6">
          <FileManager
            entityType="department"
            entityId={departmentId}
            fileType="supporting"
            title={t("Supporting Files")}
            onUploadComplete={(fileId, fileUrl) => handleSupportingFileUpload(fileId, fileUrl)}
          />
        </div>
      )}

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
              {!reportEditMode[index] && isValidUrl(field.templateFile) ? (
                // Show open file button with edit option
                <div className="flex">
                  <div
                    className={`${isLightMode
                      ? "bg-dark text-white"
                      : "bg-secondary text-white"
                      } px-4 py-2 mt-1 rounded-l-lg flex-1 text-left flex items-center`}
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
              {!programEditMode[index] && isValidUrl(field.programFile) ? (
                // Show open file button with edit option
                <div className="flex">
                  <div
                    className={`${isLightMode
                      ? "bg-dark text-white"
                      : "bg-secondary text-white"
                      } px-4 py-2 mt-1 rounded-l-lg flex-1 text-left flex items-center`}
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