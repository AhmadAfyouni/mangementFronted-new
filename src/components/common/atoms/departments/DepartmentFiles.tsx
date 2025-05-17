import { FileManager } from '@/components/common/atoms/fileManager';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import React from 'react';

interface DepartmentFilesProps {
  departmentId: string;
}

/**
 * Component to manage files associated with a department
 */
const DepartmentFiles: React.FC<DepartmentFilesProps> = ({
  departmentId
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  if (!departmentId) {
    return (
      <div className={`p-4 rounded-lg ${isLightMode ? 'bg-white' : 'bg-dark'}`}>
        <div className="text-center text-gray-500 py-4">
          {t('Department not selected')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supporting Files */}
      <FileManager
        entityType="department"
        entityId={departmentId}
        fileType="supporting"
        title={t('Supporting Files')}
        description={t('Supporting department documentation')}
        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      />

      {/* Report Templates */}
      <FileManager
        entityType="department"
        entityId={departmentId}
        fileType="template"
        title={t('Report Templates')}
        description={t('Templates for required reports')}
        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      />

      {/* Development Program Files */}
      <FileManager
        entityType="department"
        entityId={departmentId}
        fileType="program"
        title={t('Development Program Files')}
        description={t('Files related to development programs')}
        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      />
    </div>
  );
};

export default DepartmentFiles;