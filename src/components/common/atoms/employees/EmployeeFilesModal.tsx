import React from 'react';
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>
        
        <div 
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ${
            isLightMode ? 'bg-white' : 'bg-dark'
          }`}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className={`text-lg leading-6 font-medium ${
                  isLightMode ? 'text-gray-900' : 'text-white'
                }`}
              >
                {t('Employee Files')}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2 space-y-4">
              {/* Legal Documents */}
              <div className="mb-6">
                <FileManager 
                  entityType="employee"
                  entityId={employeeId}
                  fileType="legal"
                  title={t("Legal Documents")}
                  description={t("Identity and legal documentation")}
                />
              </div>
              
              {/* Certifications */}
              <div className="mb-6">
                <FileManager 
                  entityType="employee"
                  entityId={employeeId}
                  fileType="certification"
                  title={t("Certifications")}
                  description={t("Professional certifications and qualifications")}
                />
              </div>
              
              {/* Other Employee Documents */}
              <div className="mb-6">
                <FileManager 
                  entityType="employee"
                  entityId={employeeId}
                  fileType="document"
                  title={t("Other Documents")}
                  description={t("Additional employee documentation")}
                />
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
            isLightMode ? 'bg-gray-50' : 'bg-gray-900'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilesModal;