import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { addSubTaskSchema } from "@/schemas/task.schema";
import fileUploadService from "@/services/fileUpload.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import FormLabel from "@/components/common/atoms/ui/FormLabel";
import { Loader2, X } from "lucide-react";

// Interface for file upload state
interface UploadingFile {
  file: File;
  name: string;
  progress: number;
  id: string;
  uploaded?: boolean;
  url?: string;
}

const AddSubTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  parentTask?: ReceiveTaskType;
}> = ({ isOpen, onClose, parentTask }) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  // Used in onSuccessFn and error handling callbacks
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  // Used in handleFileChange - needed for tracking upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(addSubTaskSchema),
    defaultValues: {
      // Pre-fill with parent task data where appropriate
      priority: parentTask?.priority || "",
    }
  });

  // Register files field
  register("files");

  // Fetch employee data
  const { data: employees } = useCustomQuery<{ tree: EmpTree[] }>({
    queryKey: ["employees"],
    url: `/emp/tree`,
  });

  // Fetch sections
  const { data: sections } = useCustomQuery<{ id: string, name: string }[]>({
    queryKey: ["sections"],
    url: `/sections`,
  });

  const { mutate: addSubTask, isPending } = useCreateMutation({
    endpoint: `/tasks/add-subtask/${parentTask?.id}`,
    onSuccessMessage: `SubTask Added successfully!`,
    invalidateQueryKeys: ["tasks", `task-${parentTask?.id}`],
    onSuccessFn() {
      reset();
      setUploadingFiles([]);
      setUrls([]);
      setFeedbackMessage("Subtask added successfully!");
      setTimeout(() => {
        onClose();
        setFeedbackMessage(null);
      }, 1500);
    },
    options: {
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        setFeedbackMessage(err?.response?.data?.message || "Failed to add subtask. Please try again.");
      }
    }
  });

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      // Create new file objects with unique IDs and progress state
      const newFiles: UploadingFile[] = Array.from(e.target.files).map(
        (file) => ({
          file,
          name: file.name,
          progress: 0,
          id: Math.random().toString(36).substring(2, 9),
        })
      );

      // Add them to the display list immediately with 0% progress
      setUploadingFiles((prev) => [...prev, ...newFiles]);

      try {
        // Upload each file with progress simulation
        for (const fileObj of newFiles) {
          // Simulate progress updates before actual upload
          const progressInterval = setInterval(() => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id && f.progress < 90
                  ? { ...f, progress: f.progress + (10 + Math.random() * 10) }
                  : f
              )
            );
          }, 300);

          // Upload the actual file
          try {
            const url = await fileUploadService.uploadSingleFile(
              { file: fileObj.file, name: fileObj.name },
              "tasks"
            );

            // Update the file status
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id
                  ? { ...f, progress: 100, uploaded: true, url }
                  : f
              )
            );

            // Add to URLs list
            setUrls((prev) => {
              const newUrls = [...prev, url];
              // Update form value with all current successful URLs
              setValue("files", newUrls);
              return newUrls;
            });
          } catch (error) {
            // Mark upload as failed
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, progress: 0, uploaded: false } : f
              )
            );
            console.error(`Error uploading file: ${fileObj.name}`, error);
          } finally {
            clearInterval(progressInterval);
          }
        }
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // Remove file handler
  const removeFile = (id: string) => {
    const fileToRemove = uploadingFiles.find((f) => f.id === id);

    // Remove from uploadingFiles state
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));

    // If file was successfully uploaded, remove from URLs as well
    if (fileToRemove?.uploaded && fileToRemove.url) {
      const newUrls = urls.filter((url) => url !== fileToRemove.url);
      setUrls(newUrls);
      setValue("files", newUrls);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="absolute inset-0 bg-black bg-opacity-50 z-[99]" onClick={onClose}></div>

      <div className={`relative z-[100] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 ${isLightMode ? "bg-light-droppable-fade" : "bg-dark"}`}>
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-twhite">
            {t("Add Subtask to")}: <span className="text-blue-400">{parentTask?.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback message display */}
        {feedbackMessage && (
          <div className={`mb-4 p-3 rounded-lg ${feedbackMessage.includes("successfully") ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}`}>
            {feedbackMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => {
            setFeedbackMessage(null);

            // Helper function to convert date strings to ISO format
            const toISODate = (dateStr: string | Date | undefined | null) => {
              if (!dateStr) return undefined;
              try {
                return new Date(dateStr).toISOString();
              } catch {
                return undefined;
              }
            };

            // Helper function to convert string to number
            const toNumber = (value: unknown) => {
              if (value === undefined || value === null || value === "") return undefined;
              const num = Number(value);
              return isNaN(num) ? undefined : num;
            };

            const payload = {
              name: data.name,
              description: data.description,
              priority: data.priority,
              files: data.files ?? [],
              due_date: toISODate(data.due_date),
              emp: data.emp || undefined,
              section_id: data.section_id || undefined,
              // Update with only the fields in CreateSubTaskDto
              start_date: toISODate(data.start_date),
              expected_end_date: toISODate(data.expected_end_date),
              estimated_hours: toNumber(data.estimated_hours),
              recurringEndDate: toISODate(data.recurringEndDate),
              progressCalculationMethod: data.progressCalculationMethod,
              end_date: toISODate(data.end_date)
            };

            const filteredPayload = Object.fromEntries(
              Object.entries(payload).filter(([, value]) => value !== undefined && value !== "")
            );

            addSubTask(filteredPayload);
          })}
          className="space-y-4 text-twhite"
        >
          {/* Basic Task Information */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Basic Information")}</h3>

            <div className="space-y-4">
              {/* Task Name Field */}
              <div>
                <FormLabel required>
                  {t("Task Name")}
                </FormLabel>
                <input
                  type="text"
                  {...register("name")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.name ? "border border-red-500" : ""
                    }`}
                  placeholder={t("Enter task name")}
                />
                {errors.name && (
                  <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <FormLabel required>
                  {t("Description")}
                </FormLabel>
                <textarea
                  {...register("description")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.description ? "border border-red-500" : ""
                    }`}
                  placeholder={t("Enter task description")}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 mt-1 text-sm">{errors.description.message}</p>
                )}
              </div>

              {/* Priority Field */}
              <div>
                <FormLabel required>
                  {t("Priority")}
                </FormLabel>
                <select
                  {...register("priority")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.priority ? "border border-red-500" : ""
                    }`}
                >
                  <option value="">{t("Select a priority")}</option>
                  {["HIGH", "MEDIUM", "LOW"].map((priority) => (
                    <option key={priority} value={priority}>
                      {t(priority)}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="text-red-500 mt-1 text-sm">{errors.priority.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Estimation */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Dates & Estimation")}</h3>
            <div className="space-y-4">
              {/* Grid for dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date Field */}
                <div>
                  <FormLabel required>
                    {t("Start Date")}
                  </FormLabel>
                  <input
                    type="date"
                    {...register("start_date")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.start_date ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 mt-1 text-sm">{errors.start_date.message}</p>
                  )}
                </div>

                {/* Due Date Field */}
                <div>
                  <FormLabel required>
                    {t("Due Date")}
                  </FormLabel>
                  <input
                    type="date"
                    {...register("due_date")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.due_date ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.due_date && (
                    <p className="text-red-500 mt-1 text-sm">{errors.due_date.message}</p>
                  )}
                </div>

                {/* Expected End Date Field */}
                <div>
                  <FormLabel required>
                    {t("Expected End Date")}
                  </FormLabel>
                  <input
                    type="date"
                    {...register("expected_end_date")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.expected_end_date ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.expected_end_date && (
                    <p className="text-red-500 mt-1 text-sm">{errors.expected_end_date.message}</p>
                  )}
                </div>

                {/* Estimated Hours Field */}
                <div>
                  <FormLabel>
                    {t("Estimated Hours")}
                  </FormLabel>
                  <input
                    type="number"
                    {...register("estimated_hours")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.estimated_hours ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.estimated_hours && (
                    <p className="text-red-500 mt-1 text-sm">{errors.estimated_hours.message}</p>
                  )}
                </div>

                {/* Recurring End Date Field */}
                <div>
                  <FormLabel required>
                    {t("Recurring End Date")}
                  </FormLabel>
                  <input
                    type="date"
                    {...register("recurringEndDate")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.recurringEndDate ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.recurringEndDate && (
                    <p className="text-red-500 mt-1 text-sm">{errors.recurringEndDate.message}</p>
                  )}
                </div>

                {/* Progress Calculation Method Field */}
                <div>
                  <FormLabel>
                    {t("Progress Calculation Method")}
                  </FormLabel>
                  <select
                    {...register("progressCalculationMethod")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.progressCalculationMethod ? "border border-red-500" : ""
                      }`}
                  >
                    <option value="">{t("Select a method")}</option>
                    <option className="text-tmid" value="time_based">
                      {t("Time Based")}
                    </option>
                    <option className="text-tmid" value="date_based">
                      {t("Date Based")}
                    </option>
                  </select>
                  {errors.progressCalculationMethod && (
                    <p className="text-red-500 mt-1 text-sm">{errors.progressCalculationMethod.message}</p>
                  )}
                </div>

                {/* End Date Field */}
                <div>
                  <FormLabel required>
                    {t("End Date")}
                  </FormLabel>
                  <input
                    type="date"
                    {...register("end_date")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.end_date ? "border border-red-500" : ""
                      }`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 mt-1 text-sm">{errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("File Upload")}</h3>
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <FormLabel>
                  {t("Add Files")}
                </FormLabel>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.files ? "border border-red-500" : ""
                      }`}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {errors.files && (
                  <p className="text-red-500 mt-1 text-sm">{errors.files.message}</p>
                )}
              </div>

              {/* File List */}
              <div>
                <FormLabel>
                  {t("Files")}
                </FormLabel>
                <div className="flex flex-wrap">
                  {uploadingFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 mb-2">
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section Selection */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Section")}</h3>
            <div className="space-y-4">
              <div>
                <FormLabel>
                  {t("Select Section")}
                </FormLabel>
                <select
                  {...register("section_id")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.section_id ? "border border-red-500" : ""
                    }`}
                >
                  <option value="">{t("Select a section")}</option>
                  {sections?.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {errors.section_id && (
                  <p className="text-red-500 mt-1 text-sm">{errors.section_id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Employee")}</h3>
            <div className="space-y-4">
              <div>
                <FormLabel required>
                  {t("Select Employee")}
                </FormLabel>
                <select
                  {...register("emp")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg ${errors.emp ? "border border-red-500" : ""
                    }`}
                >
                  <option value="">{t("Select an employee")}</option>
                  {employees?.tree.filter((item) => item.department == parentTask?.department?.name).map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                {errors.emp && (
                  <p className="text-red-500 mt-1 text-sm">{errors.emp.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              disabled={isPending}
            >
              <PendingLogic
                isPending={isPending}
                normalText="Add Subtask"
                pendingText="Creating..."
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubTaskModal;