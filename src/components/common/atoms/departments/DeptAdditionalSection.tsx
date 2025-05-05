/* eslint-disable @typescript-eslint/no-explicit-any */
import { XIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import FileUploadService from "@/services/fileUpload.service";
import { DepartmentFormInputs } from "@/types/DepartmentType.type";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UseFormGetValues, UseFormRegister } from "react-hook-form";

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
  supportingFiles: FileObject[];
  setSupportingFiles: React.Dispatch<React.SetStateAction<FileObject[]>>;
}

// Type for file object
export interface FileObject {
  name: string;
  file: File;
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
  setSupportingFiles,
  getValues,
}: DeptAdditionalSectionProps) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const [supportingFileUrls, setSupportingFileUrls] = useState<string[]>([]);

  // Track edit mode for each file type
  const [reportEditMode, setReportEditMode] = useState<FileEditMode>({});
  const [programEditMode, setProgramEditMode] = useState<FileEditMode>({});

  // Loading states
  const [supportingFilesLoading, setSupportingFilesLoading] = useState(false);
  const [loadingReportIndex, setLoadingReportIndex] = useState<number | null>(
    null
  );
  const [loadingProgramIndex, setLoadingProgramIndex] = useState<number | null>(
    null
  );

  // Initialize supporting files from form values
  const files = getValues("supportingFiles") || [];
  useEffect(() => {
    try {
      setSupportingFileUrls(files);
      console.log("supportingsadsa files : ", files);
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

  // Handle file selection for supporting files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setSupportingFilesLoading(true);

    try {
      // Process each file and upload it
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Add to local state for UI display
        setSupportingFiles((prev) => [
          ...prev,
          {
            name: file.name,
            file: file,
          },
        ]);

        // Upload file to server
        const fileName = await FileUploadService.uploadSingleFile(
          {
            file,
            name: file.name,
          },
          "departments"
        );

        // Add to URLs list
        setSupportingFileUrls((prev) => [...prev, fileName]);

        // Update form value
        setValue("supportingFiles", [...supportingFileUrls, fileName]);
      }
    } catch (error) {
      console.error("Error uploading supporting files:", error);
    } finally {
      setSupportingFilesLoading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    // Remove from URLs list
    const newUrls = [...supportingFileUrls];
    newUrls.splice(index, 1);
    setSupportingFileUrls(newUrls);

    // Update form value
    setValue("supportingFiles", newUrls);
  };

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

  // For debugging - log values when they change
  useEffect(() => {
    console.log("Required Reports updated:", requiredReportsFields);
  }, [requiredReportsFields]);

  useEffect(() => {
    console.log("Development Programs updated:", developmentProgramsFields);
  }, [developmentProgramsFields]);

  useEffect(() => {
    console.log("Supporting File URLs:", supportingFileUrls);
  }, [supportingFileUrls]);

  // Handle mode switching functions
  const switchReportToEditMode = (index: number) => {
    setValue(`requiredReports.${index}.templateFile`, "");
    setReportEditMode((prev) => ({ ...prev, [index]: true }));
  };

  const switchProgramToEditMode = (index: number) => {
    setValue(`developmentPrograms.${index}.programFile`, "");
    setProgramEditMode((prev) => ({ ...prev, [index]: true }));
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
      <div>
        <div className="block text-tmid text-sm font-medium">
          {t("Supporting Files")}
        </div>

        <input
          hidden
          id="file-id"
          type="file"
          multiple
          onChange={handleFileChange}
          className={`    ${isLightMode ? "bg-dark  placeholder:text-tdark " : "bg-secondary"
            }  w-full  bg-secondary border-none outline-none  px-4 py-2 mt-1 rounded-lg `}
        />

        {/* Display loading state for supporting files */}
        {supportingFilesLoading && (
          <div className="flex items-center mt-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mx-2"></div>
            <span className="text-sm text-tmid">{t("Uploading files...")}</span>
          </div>
        )}

        {/* Display existing supporting files from URLs */}
        {supportingFileUrls.map((fileUrl, index) => (
          <div key={`url-${index}`} className="flex gap-4 items-center mt-2">
            <div
              className={`${isLightMode ? "bg-dark text-white" : "bg-secondary text-white"
                } px-4 py-2 rounded-l-lg flex-1 flex items-center cursor-pointer`}
            >
              <span className="truncate">{processPublicUrl(fileUrl)}</span>
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
              onClick={() => handleRemoveFile(index)}
              className={`${isLightMode ? "bg-red-500 text-white" : "bg-red-600 text-white"
                } px-3 py-2 mt-1 rounded-r-lg`}
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

        <label
          htmlFor="file-id"
          className="text-sm text-tbright underline cursor-pointer mt-2 inline-block"
        >
          {t("Attach Supporting File")}
        </label>
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLoadingReportIndex(index);
                      try {
                        const fileName =
                          await FileUploadService.uploadSingleFile(
                            {
                              file,
                              name: file.name,
                            },
                            "departments"
                          );
                        // Set the new file URL and ensure it's a fresh URL
                        const newFileUrl = fileName.includes("?")
                          ? fileName.split("?")[0] + `?v=${Date.now()}`
                          : `${fileName}?v=${Date.now()}`;

                        setValue(
                          `requiredReports.${index}.templateFile` as const,
                          newFileUrl
                        );
                        // Switch to view mode after successful upload
                        setReportEditMode((prev) => ({
                          ...prev,
                          [index]: false,
                        }));
                      } finally {
                        setLoadingReportIndex(null);
                      }
                    }
                  }}
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLoadingProgramIndex(index);
                      try {
                        const fileName =
                          await FileUploadService.uploadSingleFile(
                            {
                              file,
                              name: file.name,
                            },
                            "departments"
                          );
                        // Set the new file URL and ensure it's a fresh URL
                        const newFileUrl = fileName.includes("?")
                          ? fileName.split("?")[0] + `?v=${Date.now()}`
                          : `${fileName}?v=${Date.now()}`;

                        setValue(
                          `developmentPrograms.${index}.programFile` as const,
                          newFileUrl
                        );
                        // Switch to view mode after successful upload
                        setProgramEditMode((prev) => ({
                          ...prev,
                          [index]: false,
                        }));
                      } finally {
                        setLoadingProgramIndex(null);
                      }
                    }
                  }}
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
