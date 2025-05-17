/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useTranslation } from "react-i18next";

// Input Field Component
export const FormInput = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  disabled = false,
  isLightMode
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {t(label)}
      </label>
      <input
        type={type}
        disabled={disabled}
        {...register(name)}
        className={`w-full px-4 py-2 rounded-lg transition-all duration-200
          ${isLightMode
            ? "bg-dark placeholder:text-tdark border-gray-300"
            : "bg-secondary border-gray-700"
          } outline-none border 
          ${errors[name] ? "border-danger" : "border-gray-300 focus:border-primary"}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
        placeholder={t(placeholder)}
      />
      {errors[name] && (
        <p className="text-danger text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

// Select Field Component
export const FormSelect = ({
  label,
  name,
  register,
  errors,
  options = [],
  onChange,
  disabled = false,
  value,
  isLightMode
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {t(label)}
      </label>
      <select
        disabled={disabled}
        {...register(name)}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-lg transition-all duration-200
          ${isLightMode
            ? "bg-dark placeholder:text-tdark"
            : "bg-secondary"
          } outline-none border 
          ${errors[name] ? "border-danger" : "border-gray-300 focus:border-primary"}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <option value="">{t(`Select a ${label.toLowerCase()}`)}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-danger text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

// Form Section Component
export const FormSection = ({ title, children, isLightMode }) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 rounded-lg mb-6 border ${isLightMode ? "bg-gray-50 border-gray-200" : "bg-dark border-gray-700"}`}>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
        {t(title)}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

// Dynamic Field Array Component
export const DynamicFieldArray = ({
  title,
  fields,
  append,
  remove,
  buttonText,
  buttonColor = "primary",
  isLightMode,
  children,
  reset,
  getValues
}) => {
  const { t } = useTranslation();

  const colorClasses = {
    primary: isLightMode
      ? "bg-primary-100 text-primary hover:bg-primary-200"
      : "bg-primary-900/30 text-primary-400 hover:bg-primary-800/40",
    success: isLightMode
      ? "bg-success-100 text-success hover:bg-success-200"
      : "bg-success-900/30 text-success-400 hover:bg-success-800/40",
    warning: isLightMode
      ? "bg-warning-100 text-warning hover:bg-warning-200"
      : "bg-warning-900/30 text-warning-400 hover:bg-warning-800/40",
  };

  return (
    <div className="border-t border-gray-700 pt-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t(title)}</h2>
        <button
          type="button"
          onClick={append}
          className={`px-3 py-1.5 rounded-md ${colorClasses[buttonColor]} text-sm flex items-center gap-1 transition-colors`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          {t(buttonText)}
        </button>
      </div>

      {fields.length === 0 ? (
        <div
          className={`text-center py-6 ${isLightMode ? "text-gray-500" : "text-gray-400"}`}
        >
          {t(`No ${title.toLowerCase()} added yet`)}
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`p-4 rounded-lg ${isLightMode
                ? "bg-gray-50 border border-gray-200"
                : "bg-dark border border-gray-700"
                }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {t(title.slice(0, -1))} #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    remove(index);
                    if (reset && getValues) {
                      reset(getValues());
                    }
                  }}
                  className={`p-1.5 rounded-full ${isLightMode
                    ? "text-danger hover:bg-danger-50"
                    : "text-danger-400 hover:bg-danger-900/20"
                    }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {children(field, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// File Upload Component
export const FileUpload = ({
  index,
  fieldName,
  fileNames,
  setFileNames,
  handleFileChange,
  isLightMode,
  setValue,
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Pass the event to parent handler
      handleFileChange(e, index, fieldName, setValue);

      // Update file names state
      setFileNames((prev) => ({
        ...prev,
        [fieldName]: {
          ...(prev[fieldName] || {}),
          [index]: file.name,
        },
      }));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset upload state after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("File upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();

    // Update the file names state by removing this file
    setFileNames((prev) => {
      const newState = { ...prev };
      if (newState[fieldName] && newState[fieldName][index]) {
        delete newState[fieldName][index];
      }
      return newState;
    });

    // Clear the file input
    const fileInput = document.getElementById(
      `fileInput-${fieldName}-${index}`
    );
    if (fileInput) {
      fileInput.value = "";
    }

    // Set the file to null in the form state
    setValue(`${fieldName}.${index}.file`, "");
  };

  const fileName = fileNames[fieldName]?.[index];

  return (
    <div className="mt-2">
      {isUploading ? (
        <div
          className={`w-full px-4 py-3 rounded-lg ${isLightMode
            ? "bg-dark border border-blue-400"
            : "bg-secondary border border-blue-600"
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs ${isLightMode ? "text-blue-600" : "text-blue-400"
                }`}
            >
              {t("Uploading file...")}
            </span>
            <span
              className={`text-xs ${isLightMode ? "text-blue-600" : "text-blue-400"
                }`}
            >
              {uploadProgress}%
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full ${isLightMode ? "bg-gray-200" : "bg-gray-700"
              }`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full px-4 py-3 rounded-lg border ${fileName ? "border-solid" : "border-dashed border-2"
            } 
            ${fileName
              ? isLightMode
                ? "border-success bg-success-100"
                : "border-success-700 bg-success-900/20"
              : isLightMode
                ? "border-gray-300 bg-gray-50"
                : "border-gray-700 bg-main"
            } 
            flex items-center cursor-pointer transition-colors hover:${isLightMode ? "bg-gray-100" : "bg-gray-700/30"
            }`}
          onClick={() =>
            document.getElementById(`fileInput-${fieldName}-${index}`)?.click()
          }
        >
          {fileName ? (
            <>
              <svg
                className={`w-4 h-4 mx-2 ${isLightMode ? "text-success" : "text-success-400"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span
                className={`text-sm truncate flex-1 ${isLightMode ? "text-gray-700" : "text-gray-300"
                  }`}
              >
                {fileName.substring(fileName.lastIndexOf("/") + 1)}
              </span>
              <button
                type="button"
                onClick={handleClearFile}
                className={`ml-2 p-1 rounded-full ${isLightMode
                  ? "text-danger hover:bg-danger-100"
                  : "text-danger-400 hover:bg-danger-900/20"
                  }`}
                title={t("Remove file")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </>
          ) : (
            <>
              <svg
                className={`w-4 h-4 mx-2 ${isLightMode ? "text-gray-400" : "text-gray-500"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span
                className={`text-sm ${isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {t("Click to upload file")}
              </span>
            </>
          )}
        </div>
      )}

      <input
        id={`fileInput-${fieldName}-${index}`}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
