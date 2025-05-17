import React, { useEffect } from 'react';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { FileManager } from '@/components/common/atoms/fileManager';

interface EmployeeFilesModalProps {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component to manage files associated with an employee
 */
const EmployeeFilesModal: React.FC<EmployeeFilesModalProps> = ({
  employeeId,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal container with perfect centering */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div
          className={`relative rounded-lg shadow-xl max-w-3xl w-full transform transition-all ${isLightMode ? 'bg-white' : 'bg-dark'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="px-6 py-4 border-b border-opacity-20 border-gray-500 flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              {t('Employee Files')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbright focus:ring-opacity-50 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body with scrollable content */}
          <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <div className="space-y-6">
              {/* Legal Documents */}
              <div className="p-4 rounded-lg bg-darker bg-opacity-5">
                <FileManager
                  entityType="employee"
                  entityId={employeeId}
                  fileType="legal"
                  title={t("Legal Documents")}
                  description={t("Identity and legal documentation")}
                  inputId="file-upload-legal"
                />
              </div>

              {/* Certifications */}
              <div className="p-4 rounded-lg bg-darker bg-opacity-5">
                <FileManager
                  entityType="employee"
                  entityId={employeeId}
                  fileType="certification"
                  title={t("Certifications")}
                  description={t("Professional certifications and qualifications")}
                  inputId="file-upload-certification"
                />
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className={`px-6 py-4 border-t border-opacity-20 border-gray-500 ${isLightMode ? 'bg-gray-50' : 'bg-dark'
            }`}>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilesModal;