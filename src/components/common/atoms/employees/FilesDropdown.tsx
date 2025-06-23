import {
  Certification,
  EmployeeType,
  LegalDocument,
} from "@/types/EmployeeType.type";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import EmployeeFilesModal from "./EmployeeFilesModal";
import { FileText, ChevronDown, Download, ExternalLink, FolderOpen } from "lucide-react";

interface FilesButtonProps {
  employee: EmployeeType;
  isLightMode: boolean;
}

// File dropdown component
const FilesDropdown: React.FC<{
  legalDocuments?: LegalDocument[];
  certifications?: Certification[];
  isOpen: boolean;
  isLightMode: boolean;
  onOpenModal: () => void;
}> = ({
  legalDocuments,
  certifications,
  isOpen,
  isLightMode,
  onOpenModal,
}) => {
    const { t } = useTranslation();
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileClick = (fileUrl: string): void => {
      setDownloadingFile(fileUrl);

      // Make sure the URL is properly formatted
      let fullUrl = fileUrl;

      // Check if URL starts with http:// or https://
      if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        fullUrl = `${baseUrl}${fileUrl}`;
      }

      // Prevent duplicate URL issues
      if (fullUrl.includes('http://http://') || fullUrl.includes('https://https://')) {
        fullUrl = fullUrl.replace('http://http://', 'http://');
        fullUrl = fullUrl.replace('https://https://', 'https://');
      }

      // Simulate download start
      setTimeout(() => {
        // Open file in new tab/download
        window.open(fullUrl, "_blank");

        // Reset downloading state
        setDownloadingFile(null);
      }, 500);
    };

    // Get file name from url
    const getFileName = (url: string) => {
      if (!url) return "File";
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      return fileName.length > 20 ? fileName.substring(0, 18) + '...' : fileName;
    };

    return (
      <div
        className={`fixed z-[9999] w-72 rounded-xl shadow-xl overflow-hidden ${isLightMode
          ? "bg-white border border-gray-200 shadow-black/20"
          : "bg-dark border border-gray-700 shadow-black/40"
          }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* View All Files button */}
        <button
          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${isLightMode
            ? "bg-blue-50 hover:bg-blue-100 text-blue-600"
            : "bg-blue-900/20 hover:bg-blue-900/30 text-blue-400"
            } flex items-center justify-between`}
          onClick={onOpenModal}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>{t("Manage All Files")}</span>
          </div>
          <ExternalLink className="w-4 h-4" />
        </button>

        {legalDocuments && legalDocuments.length > 0 ? (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
              {t("Legal Documents")}
            </div>
            <div className="max-h-44 overflow-y-auto py-1">
              {legalDocuments.map(
                (doc, idx) =>
                  doc.file && (
                    <button
                      key={`legal-${idx}`}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${isLightMode
                        ? "hover:bg-gray-100 text-gray-700"
                        : "hover:bg-gray-800 text-gray-300"
                        } flex items-center justify-between`}
                      onClick={() => handleFileClick(doc.file)}
                      disabled={downloadingFile === doc.file}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 flex-shrink-0 text-blue-400" />
                        <span className="truncate">{doc.name || getFileName(doc.file)}</span>
                      </div>
                      {downloadingFile === doc.file ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
                      ) : (
                        <Download className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )
              )}
            </div>
          </div>
        ) : null}

        {certifications && certifications.length > 0 ? (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
              {t("Certifications")}
            </div>
            <div className="max-h-44 overflow-y-auto py-1">
              {certifications.map(
                (cert, idx) =>
                  cert.file && (
                    <button
                      key={`cert-${idx}`}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${isLightMode
                        ? "hover:bg-gray-100 text-gray-700"
                        : "hover:bg-gray-800 text-gray-300"
                        } flex items-center justify-between`}
                      onClick={() => handleFileClick(cert.file)}
                      disabled={downloadingFile === cert.file}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 flex-shrink-0 text-purple-400" />
                        <span className="truncate">{cert.certificate_name || getFileName(cert.file)}</span>
                      </div>
                      {downloadingFile === cert.file ? (
                        <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent" />
                      ) : (
                        <Download className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )
              )}
            </div>
          </div>
        ) : null}

        {(!legalDocuments || legalDocuments.length === 0) &&
          (!certifications || certifications.length === 0) && (
            <div className="px-4 py-4 text-sm text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-gray-400" />
                <p>{t("No files available")}</p>
                <button
                  onClick={onOpenModal}
                  className={`mt-2 px-4 py-2 rounded-lg text-xs ${isLightMode
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                    }`}
                >
                  {t("Upload Files")}
                </button>
              </div>
            </div>
          )}
      </div>
    );
  };

// File button to open dropdown
const FilesButton: React.FC<FilesButtonProps> = ({ employee, isLightMode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const totalFiles: number =
    (employee.legal_documents?.filter((doc) => doc.file)?.length || 0) +
    (employee.certifications?.filter((cert) => cert.file)?.length || 0);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleOpenModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay when dropdown is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className="relative"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          ref={buttonRef}
          className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${isLightMode
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-blue-900/30"
            } shadow-sm hover:shadow`}
          onClick={handleButtonClick}
          title={t("Employee Files")}
        >
          <FileText className="w-4 h-4" />
          {totalFiles > 0 && (
            <span className="text-xs font-medium">{totalFiles}</span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <FilesDropdown
          legalDocuments={employee.legal_documents}
          certifications={employee.certifications}
          isOpen={isOpen}
          isLightMode={isLightMode}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* Employee Files Modal */}
      {isModalOpen && (
        <EmployeeFilesModal
          employeeId={employee.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default FilesButton;