import React from 'react';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { FileManager } from '@/components/common/atoms/fileManager';

interface EmployeeFilesProps {
  employeeId: string;
}

/**
 * Component to manage files associated with an employee
 */
const EmployeeFiles: React.FC<EmployeeFilesProps> = ({ 
  employeeId 
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  
  if (!employeeId) {
    return (
      <div className={`p-4 rounded-lg ${isLightMode ? 'bg-white' : 'bg-dark'}`}>
        <div className="text-center text-gray-500 py-4">
          {t('Employee not selected')}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Legal Documents */}
      <FileManager
        entityType="employee"
        entityId={employeeId}
        fileType="legal"
        title={t('Legal Documents')}
        description={t('Identity and legal documentation')}
        acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
      />
      
      {/* Certifications */}
      <FileManager
        entityType="employee"
        entityId={employeeId}
        fileType="certification"
        title={t('Certifications')}
        description={t('Degrees, certificates and qualifications')}
        acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
      />
      
      {/* Performance Documents */}
      <FileManager
        entityType="employee"
        entityId={employeeId}
        fileType="performance"
        title={t('Performance Documents')}
        description={t('Evaluations and performance reports')}
        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx"
      />
    </div>
  );
};

export default EmployeeFiles;