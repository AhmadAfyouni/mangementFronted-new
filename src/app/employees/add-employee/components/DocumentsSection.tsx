import fileUploadService from "@/services/fileUpload.service";
import { EmployeeFormInputs } from "@/types/EmployeeType.type";
import { AlertCircle, Award, Calendar, Check, FileText, Paperclip, Plus, Trash2, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormReset, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

const DocumentsSection = ({
  legalDocumentFields,
  appendLegalDocument,
  removeLegalDocument,
  certificationFields,
  appendCertification,
  removeCertification,
  register,
  errors,
  isLightMode,
  setValue,
  reset,
  getValues
}: {
  legalDocumentFields: Array<{ id: string; name: string; validity: string; file: string | null }>;
  appendLegalDocument: (value: { name: string; validity: string; file: string | null }) => void;
  removeLegalDocument: (index: number) => void;
  certificationFields: Array<{ id: string; certificate_name: string; date: string; grade: string; file: string | null }>;
  appendCertification: (value: { certificate_name: string; date: string; grade: string; file: string | null }) => void;
  removeCertification: (index: number) => void;
  register: UseFormRegister<EmployeeFormInputs>;
  errors: FieldErrors<EmployeeFormInputs>;
  isLightMode: boolean;
  setValue: UseFormSetValue<EmployeeFormInputs>;
  reset: UseFormReset<EmployeeFormInputs>;
  getValues: UseFormGetValues<EmployeeFormInputs>;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Legal Documents Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600/20">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-400">{t("Legal Documents")}</h2>
              <p className="text-sm text-gray-400">{t("Upload official legal documents")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => appendLegalDocument({ name: "", validity: "", file: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("Add Document")}
          </button>
        </div>

        {legalDocumentFields.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-dark/50 rounded-xl border-2 border-dashed border-gray-700">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2">{t("No legal documents added yet")}</h3>
            <p className="text-sm">{t("Click the 'Add Document' button to start adding legal documents")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {legalDocumentFields.map((field: { id: string; name: string; validity: string; file: string | null }, index: number) => (
              <div key={field.id} className="p-6 rounded-xl bg-dark border border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    {t("Legal Document")} #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      removeLegalDocument(index);
                      reset(getValues());
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title={t("Remove Document")}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Name */}
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Document Name")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`legal_documents.${index}.name`)}
                        placeholder={t("Enter document name")}
                        className="w-full px-4 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors"
                      />
                      {errors.legal_documents?.[index]?.name && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.legal_documents?.[index]?.name && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.legal_documents[index].name.message}
                      </p>
                    )}
                  </div>

                  {/* Validity Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      {t("Validity Date")}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...register(`legal_documents.${index}.validity`)}
                        className="w-full px-4 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Document File */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-green-400" />
                      {t("Document File")}
                    </label>
                    <FileUpload
                      index={index}
                      fieldName="legal_documents"
                      fileNames={{}} // Not needed with new component
                      setFileNames={() => { }} // Not needed with new component
                      handleFileChange={() => { }} // Not needed with new component
                      isLightMode={isLightMode}
                      setValue={setValue as unknown as UseFormSetValue<EmployeeFormInputs>}
                      t={t}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-400">{t("Certifications")}</h2>
              <p className="text-sm text-gray-400">{t("Add professional certifications and achievements")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => appendCertification({ certificate_name: "", date: "", grade: "", file: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("Add Certification")}
          </button>
        </div>

        {certificationFields.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-dark/50 rounded-xl border-2 border-dashed border-gray-700">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2">{t("No certifications added yet")}</h3>
            <p className="text-sm">{t("Click the 'Add Certification' button to start adding certifications")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {certificationFields.map((field: { id: string; certificate_name: string; date: string; grade: string; file: string | null }, index: number) => (
              <div key={field.id} className="p-6 rounded-xl bg-dark border border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    {t("Certification")} #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      removeCertification(index);
                      reset(getValues());
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title={t("Remove Certification")}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certificate Name */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Certificate Name")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`certifications.${index}.certificate_name`)}
                        placeholder={t("Enter certificate name")}
                        className="w-full px-4 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                      />
                      {errors.certifications?.[index]?.certificate_name && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.certifications?.[index]?.certificate_name && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.certifications[index].certificate_name.message}
                      </p>
                    )}
                  </div>

                  {/* Certification Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {t("Certification Date")}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...register(`certifications.${index}.date`)}
                        className="w-full px-4 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Grade/Score */}
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      {t("Grade")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`certifications.${index}.grade`)}
                        placeholder={t("Enter grade or score")}
                        className="w-full px-4 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                      />
                      {errors.certifications?.[index]?.grade && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.certifications?.[index]?.grade && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.certifications[index].grade.message}
                      </p>
                    )}
                  </div>

                  {/* Certificate File */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                      {t("Certificate File")}
                    </label>
                    <FileUpload
                      index={index}
                      fieldName="certifications"
                      fileNames={{}} // Not needed with new component
                      setFileNames={() => { }} // Not needed with new component
                      handleFileChange={() => { }} // Not needed with new component
                      isLightMode={isLightMode}
                      setValue={setValue as unknown as UseFormSetValue<EmployeeFormInputs>}
                      t={t}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsSection;

interface UploadingFile {
  file: File;
  name: string;
  progress: number;
  id: string;
  uploaded?: boolean;
  url?: string;
}

interface FileUploadProps {
  index: number;
  fieldName: "legal_documents" | "certifications"; // Restrict to only valid field names
  fileNames: Record<string, string>;
  setFileNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLightMode: boolean;
  setValue: UseFormSetValue<EmployeeFormInputs>;
  t?: (key: string) => string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  index,
  fieldName,
  setValue,
  t = (key: string) => key, // Default fallback if t is not provided
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Upload each file
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

          try {
            // Upload the actual file
            const url = await fileUploadService.uploadSingleFile(
              { file: fileObj.file, name: fileObj.name },
              fieldName // Use fieldName as category
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
            const newUrls = [...urls, url];
            setUrls(newUrls);

            // Update form value - set the file URL for this specific field
            if (fieldName === "legal_documents") {
              setValue(`legal_documents.${index}.file`, url);
            } else if (fieldName === "certifications") {
              setValue(`certifications.${index}.file`, url);
            }

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

    // If file was successfully uploaded, remove from URLs and form
    if (fileToRemove?.uploaded && fileToRemove.url) {
      const newUrls = urls.filter((url) => url !== fileToRemove.url);
      setUrls(newUrls);

      // Clear the form field if this was the only file
      if (newUrls.length === 0) {
        if (fieldName === "legal_documents") {
          setValue(`legal_documents.${index}.file`, null);
        } else if (fieldName === "certifications") {
          setValue(`certifications.${index}.file`, null);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id={`${fieldName}-${index}-file`}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        />
        <label
          htmlFor={`${fieldName}-${index}-file`}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors border border-gray-600 ${isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isUploading ? t("Uploading...") : t("Choose File")}
          </span>
        </label>

        {urls.length > 0 && (
          <span className="text-sm text-green-400 flex items-center gap-1">
            <Check className="w-4 h-4" />
            {urls.length} {urls.length === 1 ? "file" : "files"} uploaded
          </span>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {file.uploaded ? (
                  <>
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Uploaded
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors rounded"
                      disabled={isUploading}
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : file.progress > 0 && file.progress < 100 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-xs">
                      {Math.round(file.progress)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors rounded"
                      disabled={isUploading}
                      title="Cancel upload"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors rounded"
                    disabled={isUploading}
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar for Current Upload */}
      {uploadingFiles.some(f => f.progress > 0 && f.progress < 100) && (
        <div className="w-full">
          {uploadingFiles
            .filter(f => f.progress > 0 && f.progress < 100)
            .map(file => (
              <div key={file.id} className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Uploading {file.name}</span>
                  <span>{Math.round(file.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
