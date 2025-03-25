import {
  Certification,
  EmployeeType,
  LegalDocument,
} from "@/types/EmployeeType.type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface FilesDropdownProps {
  legalDocuments?: LegalDocument[];
  certifications?: Certification[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLightMode: boolean;
}

interface FilesButtonProps {
  employee: EmployeeType;
  isLightMode: boolean;
}

// File dropdown component
const FilesDropdown: React.FC<FilesDropdownProps> = ({
  legalDocuments,
  certifications,
  isOpen,
  isLightMode,
}) => {
  const { t } = useTranslation();
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileClick = (fileUrl: string): void => {
    setDownloadingFile(fileUrl);

    // Simulate download start
    setTimeout(() => {
      // Open file in new tab/download
      window.open(fileUrl, "_blank");

      // Reset downloading state
      setDownloadingFile(null);
    }, 500);
  };

  return (
    <div
      className={`absolute z-50 right-0 mt-1 w-64 rounded-md shadow-lg  ${
        isLightMode
          ? "bg-white border border-gray-200"
          : "bg-dark border border-gray-700"
      }`}
    >
      <div className="py-1">
        {legalDocuments && legalDocuments.length > 0 ? (
          <div>
            <div className="px-4 py-2 text-xs font-semibold opacity-70">
              {t("Legal Documents")}
            </div>
            <div className="max-h-32 overflow-y-auto">
              {legalDocuments.map(
                (doc, idx) =>
                  doc.file && (
                    <button
                      key={`legal-${idx}`}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isLightMode
                          ? "hover:bg-gray-100 text-gray-700"
                          : "hover:bg-gray-800 text-gray-300"
                      } flex items-center justify-between`}
                      onClick={() => handleFileClick(doc.file)}
                      disabled={downloadingFile === doc.file}
                    >
                      <span className="truncate">{doc.name || "Document"}</span>
                      {downloadingFile === doc.file ? (
                        <svg
                          className="animate-spin h-4 w-4 ml-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                      )}
                    </button>
                  )
              )}
            </div>
          </div>
        ) : null}

        {certifications && certifications.length > 0 ? (
          <div>
            <div className="px-4 py-2 text-xs font-semibold opacity-70 border-t border-gray-200 dark:border-gray-700">
              {t("Certifications")}
            </div>
            <div className="max-h-32 overflow-y-auto">
              {certifications.map(
                (cert, idx) =>
                  cert.file && (
                    <button
                      key={`cert-${idx}`}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isLightMode
                          ? "hover:bg-gray-100 text-gray-700"
                          : "hover:bg-gray-800 text-gray-300"
                      } flex items-center justify-between`}
                      onClick={() => handleFileClick(cert.file)}
                      disabled={downloadingFile === cert.file}
                    >
                      <span className="truncate">
                        {cert.certificate_name || "Certificate"}
                      </span>
                      {downloadingFile === cert.file ? (
                        <svg
                          className="animate-spin h-4 w-4 ml-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                      )}
                    </button>
                  )
              )}
            </div>
          </div>
        ) : null}

        {(!legalDocuments || legalDocuments.length === 0) &&
          (!certifications || certifications.length === 0) && (
            <div className="px-4 py-3 text-sm text-center opacity-70">
              {t("No files available")}
            </div>
          )}
      </div>
    </div>
  );
};

// File button to open dropdown
const FilesButton: React.FC<FilesButtonProps> = ({ employee, isLightMode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const totalFiles: number =
    (employee.legal_documents?.filter((doc) => doc.file)?.length || 0) +
    (employee.certifications?.filter((cert) => cert.file)?.length || 0);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="relative"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <button
        className={`cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full ${
          isLightMode
            ? "bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30"
            : "bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30"
        }`}
        onClick={handleButtonClick}
      >
        <div className="flex items-center">
          <svg
            className="h-5 w-5"
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
          {totalFiles > 0 && <span className="ml-1">{totalFiles}</span>}
        </div>
      </button>

      <FilesDropdown
        legalDocuments={employee.legal_documents}
        certifications={employee.certifications}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLightMode={isLightMode}
      />
    </div>
  );
};

export default FilesButton;
