import { useFilesByEntity } from '@/hooks/fileManager';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { FileEntity } from '@/types/FileManager.type';
import { useState } from 'react';

interface FileListProps {
  entityType: string;
  entityId: string;
  fileType: string; // Changed from optional to required
  title?: string;
  viewOnly?: boolean; // Added viewOnly prop
  onFileSelected?: (file: FileEntity) => void;
}

/**
 * Component to display files associated with an entity
 */
const FileList: React.FC<FileListProps> = ({
  entityType,
  entityId,
  fileType,
  title,
  viewOnly = false,
  onFileSelected
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Fetch files for this entity
  const {
    data: filesData,
    isLoading,
    isError,
    error
  } = useFilesByEntity(entityType, entityId, fileType);


  // Handle file selection
  const handleFileClick = (file: FileEntity) => {
    if (viewOnly) {
      // In view-only mode, just toggle selection for viewing details
      setSelectedFileId(prevId => prevId === file.id ? null : file.id);
      return;
    }

    if (onFileSelected) {
      onFileSelected(file);
    } else {
      // Toggle selection
      setSelectedFileId(prevId => prevId === file.id ? null : file.id);
    }
  };

  if (isLoading) {
    return (
      <div className={`${isLightMode ? 'bg-white' : 'bg-dark'} p-4 rounded-lg`}>
        <h3 className={`font-semibold ${isLightMode ? 'text-dark' : 'text-twhite'} mb-3`}>
          {title || t('Files')}
        </h3>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
            <div className="h-4 bg-gray-400 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${isLightMode ? 'bg-white' : 'bg-dark'} p-4 rounded-lg`}>
        <h3 className={`font-semibold ${isLightMode ? 'text-dark' : 'text-twhite'} mb-3`}>
          {title || t('Files')}
        </h3>
        <div className="text-red-500">
          {t('Error loading files')}: {error?.message}
        </div>
      </div>
    );
  }

  const files = filesData?.data?.files || [];

  return (
    <div className={`${isLightMode ? 'bg-white' : 'bg-dark'} p-4 rounded-lg`}>
      <h3 className={`font-semibold ${isLightMode ? 'text-dark' : 'text-twhite'} mb-3 flex justify-between items-center`}>
        <span>{title || t('Files')}</span>
        {viewOnly && <span className={`text-xs px-2 py-1 rounded-full ${isLightMode ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'}`}>{t('View Only')}</span>}
      </h3>

      {files.length === 0 ? (
        <div className={`text-center py-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('No files available')}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`
                p-3 rounded-md transition-colors
                ${viewOnly ? 'cursor-default' : 'cursor-pointer'}
                ${selectedFileId === file.id
                  ? (isLightMode ? 'bg-blue-100' : 'bg-blue-900')
                  : (isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-tblack hover:bg-darker')
                }
              `}
              onClick={() => handleFileClick(file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate flex-1">
                  <svg
                    className={`h-5 w-5 ${isLightMode ? 'text-gray-600' : 'text-tmid'}`}
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
                  <span className={`${isLightMode ? 'text-gray-800' : 'text-twhite'} text-sm truncate max-w-xs`}>
                    {file.originalName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-tdark'}`}>
                    v{file.currentVersion?.version || 1}
                  </span>

                </div>
              </div>
              {selectedFileId === file.id && (
                <div className={`mt-2 text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  <p>
                    {t('Uploaded')}: {new Date(file.createdAt).toLocaleString()}
                  </p>
                  <p>
                    {t('Type')}: {file.fileType}
                  </p>
                  {file.currentVersion?.description && (
                    <p>
                      {t('Description')}: {file.currentVersion.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;