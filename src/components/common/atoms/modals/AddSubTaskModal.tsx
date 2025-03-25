import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import { addSubTaskSchema } from "@/schemas/task.schema";
import fileUploadService from "@/services/fileUpload.service";
import { ReceiveTaskType } from "@/types/Task.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Define the file upload interface
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
  const { t } = useTranslation();
  const { isLightMode } = useCustomTheme();

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
  });

  // Register the files field
  register("files");

  const { data: employees } = useCustomQuery<{ tree: EmpTree[] }>({
    queryKey: ["employees"],
    url: `/emp/tree`,
  });

  const { mutate: addSection, isPending } = useCreateMutation({
    endpoint: `/tasks/add-subtask/${parentTask?.id}`,
    onSuccessMessage: `SubTask Added successfully!`,
    invalidateQueryKeys: ["tasks"],
    onSuccessFn() {
      reset();
      setUploadingFiles([]);
      setUrls([]);
      setTimeout(onClose, 1000);
    },
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
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-dark rounded-xl shadow-md w-[500px] h-[90%] text-twhite space-y-4 p-6 relative overflow-hidden overflow-y-auto no-scrollbar">
          <button
            onClick={onClose}
            className="text-twhite absolute top-4 right-4 text-xl"
          >
            &times;
          </button>
          <div>
            <form
              onSubmit={handleSubmit(async (data) => {
                addSection(data);
              })}
            >
              {/* Task Name Field */}
              <div className="mb-4">
                <label className="block text-tmid text-sm font-medium">
                  {t("Task Name")}
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-2 mt-1 bg-secondary outline-none rounded-lg ${
                    errors.name ? "border border-red-500" : "border-none"
                  }`}
                  placeholder={t("Enter task name")}
                />

                {errors.name && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="mb-4">
                <label className="block text-tmid text-sm font-medium">
                  {t("Description")}
                </label>
                <textarea
                  {...register("description")}
                  className={`w-full px-4 py-2 mt-1 bg-secondary outline-none rounded-lg ${
                    errors.description ? "border border-red-500" : "border-none"
                  }`}
                  placeholder={t("Enter task description")}
                />
                {errors.description && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority Field */}
              <div className="mb-4">
                <label className="block text-tmid text-sm font-medium">
                  {t("Priority")}
                </label>
                <select
                  {...register("priority")}
                  className={`w-full px-4 py-2 mt-1 bg-secondary outline-none rounded-lg ${
                    errors.priority ? "border border-red-500" : "border-none"
                  }`}
                >
                  <option value="">{t("Select a priority ")}</option>
                  {["HIGH", "MEDIUM", "LOW"].map((priority, index) => (
                    <option className="" key={index} value={priority}>
                      {t(priority)}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Due Date Field */}
              <div className="mb-4">
                <label className="block text-tmid text-sm font-medium">
                  {t("Due Date")}
                </label>
                <input
                  type="date"
                  {...register("due_date")}
                  className={`w-full px-4 py-2 mt-1 bg-secondary outline-none rounded-lg ${
                    errors.due_date ? "border border-red-500" : "border-none"
                  }`}
                />
                {errors.due_date && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.due_date.message}
                  </p>
                )}
              </div>

              {/* Employee Field */}
              <div className="mb-4">
                <label className="block text-tmid text-sm font-medium">
                  {t("Assigned Employee")}
                </label>
                <select
                  {...register("emp")}
                  className={`w-full px-4 py-2 mt-1 bg-secondary outline-none rounded-lg ${
                    errors.emp ? "border border-red-500" : "border-none"
                  }`}
                >
                  <option value="">{t("Select an employee")}</option>
                  {employees &&
                    employees.tree &&
                    employees.tree.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name + " - " + emp.title}
                      </option>
                    ))}
                </select>
                {errors.emp && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.emp.message}
                  </p>
                )}
              </div>

              {/* File Upload Section */}
              <div className="mb-4 bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold text-twhite mb-3">
                  {t("Attachments")}
                </h3>

                <div className="mb-4">
                  <div className="flex items-center space-x-2">
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer 
                        ${
                          isLightMode
                            ? "bg-tblack text-twhite"
                            : "bg-slate-800 text-twhite"
                        }
                        hover:bg-slate-700  transition-colors 
                        hover:text-white 
                        ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span>
                        {isUploading ? t("Uploading...") : t("Add Files")}
                      </span>
                    </label>
                    <span className="text-sm text-tdark">
                      {urls.length > 0
                        ? t("{{count}} files uploaded").replace(
                            "{{count}}",
                            urls.length.toString()
                          )
                        : t("No files uploaded")}
                    </span>
                  </div>

                  {errors.files && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.files.message}
                    </p>
                  )}
                </div>

                {/* File List */}
                {uploadingFiles.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm text-tdark mb-2">{t("Files")}:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {uploadingFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`rounded-md ${
                            isLightMode ? "bg-slate-700" : "bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-2 truncate flex-1">
                              <svg
                                className="h-5 w-5 text-tmid"
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
                              <span className="text-twhite text-sm truncate max-w-xs">
                                {file.name}
                              </span>
                              <span className="text-xs text-tdark whitespace-nowrap">
                                {(file.file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>

                            {file.uploaded ? (
                              <div className="flex items-center gap-2">
                                <span className="text-green-400 text-xs flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
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
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
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
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line
                                        x1="18"
                                        y1="6"
                                        x2="6"
                                        y2="18"
                                      ></line>
                                      <line
                                        x1="6"
                                        y1="6"
                                        x2="18"
                                        y2="18"
                                      ></line>
                                    </svg>
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

              <button
                type="submit"
                className={`w-full py-2 mt-4 bg-slate-600 text-twhite rounded-lg font-bold hover:bg-slate-700 transition duration-200 ${
                  isPending || isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={isPending || isUploading}
              >
                {isPending ? t("Creating...") : t("Create SubTask")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddSubTaskModal;
