/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useLanguage from "@/hooks/useLanguage";
import useQueryData from "@/hooks/useQueryPageData";
import { templateType, transactionType } from "@/types/new-template.type";
import { addDurationToDate } from "@/utils/add_duration_to_date";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import fileUploadService from "@/services/fileUpload.service";

interface FormFields {
  start_date: string;
  fields: Record<string, string | number | File>;
}

interface FileStatus {
  fieldName: string;
  isUploading: boolean;
  progress: number;
  url?: string;
  error?: string;
}

const NewTransaction = () => {
  const { t, getDir } = useLanguage();
  const router = useRouter();
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>(
    {}
  );
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormFields>({
    defaultValues: {
      start_date: new Date().toISOString().split("T")[0],
      fields: {},
    },
  });

  // @ts-ignore
  const transaction = useQueryData<transactionType>(reset, "restartData");

  // @ts-ignore
  const templateData = useQueryData<templateType>(reset);

  const template = useMemo(() => {
    return transaction?.template || templateData;
  }, [transaction, templateData]);

  const [endDate, setEndDate] = useState<string>("");
  const startDate = watch("start_date");

  const durationUnit = template?.duration?.unit;

  // Initialize form data when transaction is available
  useEffect(() => {
    if (transaction?.fields && !isDirty) {
      const fieldValues = transaction.fields.reduce((acc, field) => {
        if (typeof field.value !== "undefined" && field.value !== null) {
          acc[field.field_name] = field.value;
        }
        return acc;
      }, {} as Record<string, string | number | File>);

      reset({
        start_date: transaction.start_date,
        fields: fieldValues,
      });
    }
  }, [transaction, isDirty, reset]);

  useEffect(() => {
    if (startDate && template?.duration) {
      const calculatedEnd = addDurationToDate(
        startDate,
        template.duration,
        getDir
      );
      setEndDate(calculatedEnd);
    }
  }, [getDir, startDate, template]);

  const { mutateAsync: createTransaction, isPending } = useCreateMutation({
    endpoint: "/transactions",
    invalidateQueryKeys: ["my-transactions"],
    requestType: "post",
    onSuccessFn: () => {
      router.back();
    },
  });
  const { mutateAsync: restartTransaction, isPending: isRestartPending } =
    useCreateMutation({
      endpoint: `/transactions/restart/${transaction?._id}`,
      invalidateQueryKeys: ["my-transactions"],
      onSuccessFn: () => {
        router.back();
      },
    });

  // Handle file change for a specific field
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    // Update file status to show it's uploading
    setFileStatuses((prev) => ({
      ...prev,
      [fieldName]: {
        fieldName,
        isUploading: true,
        progress: 0,
      },
    }));

    try {
      setIsUploadingFiles(true);

      // Simulate progress updates
      const interval = setInterval(() => {
        setFileStatuses((prev) => {
          const current = prev[fieldName];
          if (current && current.isUploading && current.progress < 90) {
            return {
              ...prev,
              [fieldName]: {
                ...current,
                progress: current.progress + 10,
              },
            };
          }
          return prev;
        });
      }, 300);

      // Upload the file
      const url = await fileUploadService.uploadSingleFile(
        { file, name: file.name },
        "transactions"
      );

      // Clear interval and update status
      clearInterval(interval);

      // Update file status with URL
      setFileStatuses((prev) => ({
        ...prev,
        [fieldName]: {
          fieldName,
          isUploading: false,
          progress: 100,
          url,
        },
      }));

      // Save the URL in the form data
      setValue(`fields.${fieldName}`, url);
    } catch (error) {
      console.error("File upload error:", error);
      setFileStatuses((prev) => ({
        ...prev,
        [fieldName]: {
          fieldName,
          isUploading: false,
          progress: 0,
          error: "Upload failed. Please try again.",
        },
      }));
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Clear a file upload
  const clearFileUpload = (fieldName: string) => {
    // Reset the file input
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName]!.value = "";
    }

    // Clear the file status
    setFileStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[fieldName];
      return newStatuses;
    });

    // Clear the form value
    setValue(`fields.${fieldName}`, "");
  };

  // Submit handler
  const onSubmit = (data: FormFields) => {
    if (!template) return;

    // Format the fields with proper values, including file URLs
    const formattedFields = Object.entries(data.fields).map(
      ([field_name, value]) => {
        // If this field has a file URL in fileStatuses, use that URL
        if (fileStatuses[field_name]?.url) {
          return {
            field_name,
            value: fileStatuses[field_name].url,
          };
        }

        return {
          field_name,
          value: value ?? "",
        };
      }
    );

    const formattedData = {
      template_id: template._id,
      start_date: data.start_date,
      fields: formattedFields,
    };

    if (transaction) restartTransaction(formattedData);
    else createTransaction(formattedData);
  };

  const getStartDateInputType = () => {
    switch (durationUnit) {
      case "days":
        return "date";
      case "hours":
        return "datetime-local";
      case "months":
        return "month";
      default:
        return "date";
    }
  };

  if (!template) return null;

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row justify-between items-center gap-5 mb-5">
        <h1 className="text-3xl font-bold text-twhite text-center pb-4">
          {transaction ? t("Restart Transaction") : t("New Transaction")}
        </h1>
      </div>

      <div className="col-span-full mb-6">
        <div className="p-6 rounded-lg border border-gray-600 bg-secondary shadow-md text-twhite">
          <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
          <p className="text-tmid mb-4">{template.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="gap-2">
              <p className="text-sm text-tmid">
                <span className="font-medium text-twhite">{t("Type")}: </span>
                {template.type}
              </p>
              <p className="text-sm text-tmid">
                <span className="font-medium text-twhite">
                  {t("Duration")}:{""}
                </span>
                {template.duration.value} {t(template.duration.unit)}
              </p>
            </div>
            <div className="gap-2">
              {startDate && (
                <p className="text-sm text-tmid" dir={getDir()}>
                  <span className="font-medium text-twhite">
                    {t("End Date")}:{""}
                  </span>
                  {endDate}
                </p>
              )}
              {template.needAdminApproval && (
                <p className="text-sm text-tmid">
                  <span className="font-medium text-twhite">
                    {t("Admin Approval")}:{""}
                  </span>
                  {t("Required")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date Input */}
          <div>
            <label className="block text-sm font-medium text-twhite mb-2">
              {t("Start Date")}
            </label>
            <input
              {...register("start_date", { required: true })}
              type={getStartDateInputType()}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200"
            />
          </div>

          {/* Transaction Fields */}
          {template.transactionFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-twhite mb-2">
                {field.name}
              </label>
              {field.type === "text" && (
                <input
                  {...register(`fields.${field.name}`)}
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200"
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  {...register(`fields.${field.name}`)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200"
                />
              )}
              {field.type === "number" && (
                <input
                  {...register(`fields.${field.name}`)}
                  type="number"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200"
                />
              )}
              {field.type === "file" && (
                <div>
                  <input
                    type="hidden"
                    {...register(`fields.${field.name}`)}
                    value={fileStatuses[field.name]?.url || ""}
                  />

                  {fileStatuses[field.name]?.url ? (
                    <div className="flex items-center justify-between bg-dark p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-green-400"
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
                        <span className="text-sm text-twhite truncate max-w-xs">
                          {fileStatuses[field.name].url?.split("/").pop() ||
                            "File uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearFileUpload(field.name)}
                        className="text-red-400 hover:text-red-300"
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
                    <div>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, field.name)}
                        ref={(el) => {
                          if (el) {
                            fileInputRefs.current[field.name] = el;
                          }
                        }}
                        disabled={fileStatuses[field.name]?.isUploading}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200 file:mx-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-dark file:text-twhite hover:file:bg-dark/90"
                      />
                      {fileStatuses[field.name]?.isUploading && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-150"
                              style={{
                                width: `${fileStatuses[field.name].progress}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-400 mt-1">
                            {t("Uploading")}:{""}
                            {Math.round(fileStatuses[field.name].progress)}%
                          </p>
                        </div>
                      )}
                      {fileStatuses[field.name]?.error && (
                        <p className="text-xs text-red-400 mt-1">
                          {fileStatuses[field.name].error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {field.type === "select" && (
                <select
                  {...register(`fields.${field.name}`)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-secondary text-twhite focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition duration-200"
                >
                  <option value="">{t("Select an option")}</option>
                  <option value="low">{t("Low")}</option>
                  <option value="medium">{t("Medium")}</option>
                  <option value="high">{t("High")}</option>
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending || isRestartPending || isUploadingFiles}
          className={`mt-8 w-full bg-dark hover:bg-dark/90 text-twhite px-6 py-3 rounded-lg transition duration-200 font-medium ${isPending || isRestartPending || isUploadingFiles
            ? "opacity-70 cursor-not-allowed"
            : ""
            }`}
        >
          <PendingLogic
            isPending={isPending || isRestartPending || isUploadingFiles}
            normalText={
              transaction ? t("Restart Transaction") : t("Create Transaction")
            }
            pendingText={
              isUploadingFiles ? t("Uploading Files...") : t("Submitting...")
            }
          />
        </button>
      </form>
    </GridContainer>
  );
};

export default NewTransaction;
