import { PaperClipIcon } from "@/assets";
import fileUploadService from "@/services/fileUpload.service";
import { FileObject } from "@/types/FileManager.type";
import { TaskFormInputs } from "@/types/Task.type";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface FileUploadSectionProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  isLightMode: boolean;
  t: (key: string) => string;
  setValue: UseFormSetValue<TaskFormInputs>;
}

interface UploadingFile extends FileObject {
  progress: number;
  id: string;
  uploaded?: boolean;
  url?: string;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  register,
  errors,
  isLightMode,
  t,
  setValue,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Register files array in the form
  register("files");

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
        // Create a simulated progress updater for each file
        // Note: Your actual fileUploadService might not support progress,
        // but we'll simulate it for better UX
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
            setUrls((prev) => [...prev, url]);

            // Update form value with all current successful URLs
            setValue("files", [...urls, url]);
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

  return (
    <div className="bg-dark p-4 rounded-lg">
      <h3 className="font-semibold text-twhite mb-3">{t("Attachments")}</h3>

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
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${isLightMode ? "bg-secondary text-twhite" : "bg-tblack text-twhite"
              } hover:bg-secondary transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <Image
              src={PaperClipIcon}
              alt="paperclip icon"
              width={16}
              height={16}
            />
            <span>{isUploading ? t("Uploading...") : t("Add Files")}</span>
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
          <p className="text-red-500 text-sm mt-1">{errors.files.message}</p>
        )}
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm text-tdark mb-2">{t("Files")}:</h4>
          <div className="gap-2 max-h-40 overflow-y-auto pr-2">
            {uploadingFiles.map((file) => (
              <div
                key={file.id}
                className={`rounded-md ${isLightMode ? "bg-light-droppable-fade" : "bg-tblack"
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
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
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
  );
};

export default FileUploadSection;
