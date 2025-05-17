/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileManager } from '@/components/common/atoms/fileManager';
import { useFileUpload } from '@/hooks/fileManager';
import useLanguage from "@/hooks/useLanguage";
import useSnackbar from "@/hooks/useSnackbar";
import FileUploadService from "@/services/fileUpload.service";
import { DepartmentFormInputs, FileData } from "@/types/DepartmentType.type";
import { Briefcase, Edit, ExternalLink, FileText, Plus, Trash, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  departmentId?: string; // Added departmentId prop for existing departments
  isLightMode?: boolean; // Added isLightMode prop for styling
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

  const { setSnackbarConfig } = useSnackbar();
  const [supportingFileUrls, setSupportingFileUrls] = useState<FileData[]>([]);

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
  }, [requiredReportsFields, reportEditMode]);

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
  }, [developmentProgramsFields, programEditMode]);

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

  // Helper function to safely get file URL from a FileData object or string
  const getFileUrl = (fileData: FileData | string): string => {
    if (typeof fileData === 'string') {
      return fileData;
    }
    return fileData?.currentVersion?.fileUrl || '';
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
      // Create a proper FileData object from the string URL
      const fileDataObj: FileData = {
        _id: Date.now().toString(), // Generate temporary ID
        originalName: input.split('/').pop() || 'file',
        entityType: 'department',
        entityId: departmentId || 'new',
        fileType: 'supporting',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
        currentVersion: {
          _id: Date.now().toString(),
          fileId: Date.now().toString(),
          fileUrl: input,
          originalName: input.split('/').pop() || 'file',
          version: 1,
          fileType: 'supporting',
          isCurrentVersion: true,
          description: '',
          createdBy: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
          id: Date.now().toString()
        }
      };
      // Make sure we're storing the public URL as a FileData object
      const newUrls = [...supportingFileUrls, fileDataObj];
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
          const publicUrl = await handleDirectFileUpload(file);
          console.log('Supporting file uploaded, adding URL:', publicUrl);

          // Create a proper FileData object
          const fileDataObj: FileData = {
            _id: Date.now().toString(), // Generate temporary ID
            originalName: file.name,
            entityType: 'department',
            entityId: departmentId || 'new',
            fileType: 'supporting',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
            currentVersion: {
              _id: Date.now().toString(),
              fileId: Date.now().toString(),
              fileUrl: publicUrl,
              originalName: file.name,
              version: 1,
              fileType: 'supporting',
              isCurrentVersion: true,
              description: '',
              createdBy: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              __v: 0,
              id: Date.now().toString()
            }
          };

          // Store the FileData object in both state and form value
          const newUrls = [...supportingFileUrls, fileDataObj];
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
    // No changes needed here as we're working with indices
    const newUrls = [...supportingFileUrls];
    newUrls.splice(index, 1);
    setSupportingFileUrls(newUrls);
    setValue("supportingFiles", newUrls);
  };

  const { uploadFileAsync } = useFileUpload();

  // Using direct file upload for files when creating a new department
  const handleDirectFileUpload = async (file: File) => {
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
          fileUrl = await handleDirectFileUpload(file);
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
          fileUrl = await handleDirectFileUpload(file);
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
  const handleOpenFile = (fileUrl: string | FileData) => {
    const url = getFileUrl(fileUrl);
    if (!url) return;

    try {
      // Determine if URL needs the base URL prepended
      let fullUrl = url;

      // If it's a relative path, prepend the base URL
      if (url.startsWith('/public-files/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://168.231.110.121:8011';
        fullUrl = `${baseUrl}${url}`;
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Numeric Owners Section */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">{t("Numeric Owners")}</h2>
        </div>

        <div className="space-y-3">
          {numericOwnersFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-lg bg-main  flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <select
                  {...register(`numericOwners.${index}.category` as const)}
                  className={`bg-secondary p-2 rounded-lg flex-1`}
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
                <button
                  type="button"
                  onClick={() => removeNumericOwner(index)}
                  className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
                  title={t("Remove")}
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="number"
                  {...register(`numericOwners.${index}.count` as const, {
                    valueAsNumber: true,
                  })}
                  placeholder={t("Count")}
                  className="bg-secondary p-2 rounded-lg flex-1 "
                />
              </div>

              {errors.numericOwners?.[index]?.category && (
                <p className="text-red-500 text-sm">
                  {errors.numericOwners?.[index]?.category?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendNumericOwner({ count: 1, category: "" })}
            className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("Add Numeric Owner")}
          </button>
        </div>
      </div>

      {/* Supporting Files Section */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold">{t("Supporting Files")}</h2>
        </div>

        {departmentId && departmentId !== 'new' ? (
          <FileManager
            entityType="department"
            entityId={departmentId}
            fileType="supporting"
            title={t("Supporting Files")}
            onUploadComplete={(_, fileUrl) => handleSupportingFileUpload(fileUrl)}
          />
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-main ">
              <input
                type="file"
                className="bg-secondary p-2 rounded-lg w-full "
                onChange={handleSupportingFileUpload}
              />
              <div className="mt-2 text-xs text-gray-400">
                {t("Upload supporting files for this department")}
              </div>
            </div>

            {/* Display already uploaded supporting files */}
            {supportingFileUrls.length > 0 && (
              <div className="space-y-2">
                {supportingFileUrls.map((fileUrl, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-main  flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="truncate">{processPublicUrl(getFileUrl(fileUrl))}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSupportingFile(index)}
                      className="p-1.5 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors ml-2 flex-shrink-0"
                      title={t("Remove file")}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required Reports Section */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold">{t("Required Reports")}</h2>
        </div>

        <div className="space-y-3">
          {requiredReportsFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-lg bg-main  space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  {...register(`requiredReports.${index}.name` as const)}
                  placeholder={t("Report Name")}
                  className="bg-secondary p-2 rounded-lg flex-1 "
                />
                <button
                  type="button"
                  onClick={() => removeRequiredReport(index)}
                  className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
                  title={t("Remove")}
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                {!isInReportEditMode(index, field.templateFile) ? (
                  // Show open file button with edit option
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(field.templateFile)}
                      className="flex items-center gap-2 p-2 rounded-l-lg bg-secondary  flex-1 text-left text-sm"
                    >
                      <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="truncate flex-1">
                        {processPublicUrl(field.templateFile)}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => switchReportToEditMode(index)}
                      className="p-2 rounded-r-lg bg-secondary  text-gray-400 hover:text-white transition-colors"
                      title={t("Replace file")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Show file input when in edit mode or no file exists
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary ">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <input
                      type="file"
                      placeholder={t("Template File")}
                      className={`bg-secondary flex-1 min-w-0 ${loadingReportIndex === index ? "opacity-50" : ""}`}
                      disabled={loadingReportIndex === index}
                      onChange={(e) => handleReportFileChange(e, index)}
                    />
                    {loadingReportIndex === index && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendRequiredReport({ name: "", templateFile: "" })}
            className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-purple-900/20 text-purple-400 hover:bg-purple-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("Add Required Report")}
          </button>
        </div>
      </div>

      {/* Development Programs Section */}
      <div className="md:col-span-3 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold">{t("Development Programs")}</h2>
        </div>

        <div className="space-y-4">
          {developmentProgramsFields.map((field, index) => (
            <div key={field.id} className="p-5 rounded-lg bg-main  space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="text"
                  {...register(`developmentPrograms.${index}.programName` as const)}
                  placeholder={t("Program Name")}
                  className="bg-secondary p-2 rounded-lg flex-1 "
                />
                <button
                  type="button"
                  onClick={() => removeDevelopmentProgram(index)}
                  className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors"
                  title={t("Remove")}
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">{t("Objective")}</label>
                  <input
                    type="text"
                    {...register(`developmentPrograms.${index}.objective` as const)}
                    placeholder={t("Program objective")}
                    className="bg-secondary p-3 rounded-lg w-full "
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">{t("Notes")}</label>
                  <textarea
                    {...register(`developmentPrograms.${index}.notes` as const)}
                    placeholder={t("Additional notes")}
                    className="bg-secondary p-3 rounded-lg w-full "
                    rows={1}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-gray-400 text-sm mb-1 block">{t("Program File")}</label>
                {!isInProgramEditMode(index, field.programFile) ? (
                  // Show open file button with edit option
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(field.programFile)}
                      className="flex items-center gap-2 p-3 rounded-l-lg bg-secondary  flex-1 text-left"
                    >
                      <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="truncate flex-1">
                        {processPublicUrl(field.programFile)}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => switchProgramToEditMode(index)}
                      className="p-3 rounded-r-lg bg-secondary  text-gray-400 hover:text-white transition-colors"
                      title={t("Replace file")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Show file input when in edit mode or no file exists
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary ">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <input
                      type="file"
                      placeholder={t("Program File")}
                      className={`bg-secondary flex-1 min-w-0 ${loadingProgramIndex === index ? "opacity-50" : ""}`}
                      disabled={loadingProgramIndex === index}
                      onChange={(e) => handleProgramFileChange(e, index)}
                    />
                    {loadingProgramIndex === index && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
                    )}
                  </div>
                )}
              </div>
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
            className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("Add Development Program")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeptAdditionalSection;