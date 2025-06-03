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
import { Clock, FileText, X } from "lucide-react";

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
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
  const { data: sections } = useCustomQuery<any[]>({
    queryKey: ["sections"],
    url: `/sections`,
    nestedData: true,
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
      onError: (error: any) => {
        setFeedbackMessage(error?.response?.data?.message || "Failed to add subtask. Please try again.");
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 ${isLightMode ? "bg-light-droppable-fade" : "bg-dark"}`}>
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

        <form
          onSubmit={handleSubmit((data) => {
            setFeedbackMessage(null);

            // Helper function to convert date strings to ISO format
            const toISODate = (dateStr: string | Date | undefined | null) => {
              if (!dateStr) return undefined;
              try {
                return new Date(dateStr).toISOString();
              } catch (e) {
                return undefined;
              }
            };

            // Helper function to convert string to number
            const toNumber = (value: any) => {
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
              actual_end_date: toISODate(data.actual_end_date),
              expected_end_date: toISODate(data.expected_end_date),
              estimated_hours: toNumber(data.estimated_hours),
              recurringEndDate: toISODate(data.recurringEndDate),
              progressCalculationMethod: data.progressCalculationMethod,
              end_date: toISODate(data.end_date)
            };

            const filteredPayload = Object.fromEntries(
              Object.entries(payload).filter(([_, value]) => value !== undefined && value !== "")
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
                <label className="block text-tmid text-sm font-medium">
                  {t("Task Name")}
                </label>
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
                <label className="block text-tmid text-sm font-medium">
                  {t("Description")}
                </label>
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
                <label className="block text-tmid text-sm font-medium">
                  {t("Priority")}
                </label>
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
                  <label className="block text-tmid text-sm font-medium">
                    {t("Start Date")}
                  </label>
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
                  <label className="block text-tmid text-sm font-medium">
                    {t("Due Date")}
                  </label>
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
              </div>

              {/* More dates in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected End Date Field */}
                <div>
                  <label className="block text-tmid text-sm font-medium">
                    {t("Expected End Date")}
                  </label>
                  <input
                    type="date"
                    {...register("expected_end_date")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                  />
                </div>

                {/* Estimated Hours Field */}
                <div>
                  <label className="block text-tmid text-sm font-medium">
                    {t("Estimated Hours")}
                  </label>
                  <input
                    type="number"
                    {...register("estimated_hours")}
                    className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                    placeholder={t("Enter estimated hours")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Assignment")}</h3>

            <div className="space-y-4">
              {/* Section Field */}
              <div>
                <label className="block text-tmid text-sm font-medium">
                  {t("Section")}
                </label>
                <select
                  {...register("section_id")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                >
                  <option value="">
                    {t("Select a section (optional)")}
                  </option>
                  {sections?.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Field */}
              <div>
                <label className="block text-tmid text-sm font-medium">
                  {t("Employee")}
                </label>
                <select
                  {...register("emp")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                >
                  <option value="">
                    {t("Select an employee (optional)")}
                  </option>
                  {employees?.tree.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.name} - ${employee.title}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3">{t("Additional Settings")}</h3>

            <div className="space-y-4">
              {/* Recurring End Date */}
              <div>
                <label className="block text-tmid text-sm font-medium">
                  {t("Recurring End Date")}
                </label>
                <input
                  type="date"
                  {...register("recurringEndDate")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                />
              </div>

              {/* Progress Calculation Method */}
              <div>
                <label className="block text-tmid text-sm font-medium">
                  {t("Progress Calculation Method")}
                </label>
                <select
                  {...register("progressCalculationMethod")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                >
                  <option value="">{t("Select a calculation method")}</option>
                  <option value="time_based">{t("Time Based")}</option>
                  <option value="date_based">{t("Date Based")}</option>
                </select>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-tmid text-sm font-medium">
                  {t("End Date")}
                </label>
                <input
                  type="date"
                  {...register("end_date")}
                  className={`${isLightMode ? "bg-dark" : "bg-secondary"} border-none outline-none w-full px-4 py-2 mt-1 rounded-lg`}
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold text-twhite mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              {t("Attachments")}
            </h3>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="task-files"
                  multiple
                  disabled={isUploading}
                />
                <label
                  htmlFor="task-files"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${isLightMode ? "bg-dark text-twhite" : "bg-secondary text-twhite"
                    } hover:bg-opacity-80 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <FileText size={16} />
                  <span>{isUploading ? t("Uploading...") : t("Add Files")}</span>
                </label>
                <span className="text-sm text-gray-400">
                  {urls.length > 0
                    ? t("{{count}} files uploaded").replace("{{count}}", urls.length.toString())
                    : t("No files uploaded")}
                </span>
              </div>
            </div>

            {/* File List */}
            {uploadingFiles.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm text-gray-400 mb-2">{t("Files")}:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`rounded-md ${isLightMode ? "bg-dark" : "bg-secondary/50"
                        }`}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 truncate flex-1">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-twhite text-sm truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {(file.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        {file.uploaded ? (
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-xs flex items-center">
                              <svg
                                className="w-4 h-4 mx-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {t("Uploaded")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              disabled={isUploading}
                              title={t("Remove file")}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {file.progress > 0 && file.progress < 100 ? (
                              <span className="text-blue-400 text-xs">
                                {Math.round(file.progress)}%
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                disabled={isUploading}
                                title={t("Remove file")}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {file.progress > 0 && file.progress < 100 && (
                        <div className="w-full h-1 rounded-full overflow-hidden bg-gray-700">
                          <div
                            className="h-full bg-blue-500 transition-all duration-150"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className={`px-4 py-3 rounded-lg ${feedbackMessage.includes("success") ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}>
              {feedbackMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isPending}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={isPending || isUploading}
            >
              <PendingLogic
                isPending={isPending}
                normalText={t("Create Subtask")}
                pendingText={t("Creating...")}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubTaskModal;
