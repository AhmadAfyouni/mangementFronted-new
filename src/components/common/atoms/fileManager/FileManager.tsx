// Console log for debugging
import useLanguage from '@/hooks/useLanguage';
import useCustomTheme from '@/hooks/useCustomTheme';
import { FileEntity } from '@/types/FileManager.type';
import FileList from './FileList';
import FileUpload from './FileUpload';
import FileDetails from './FileDetails';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface FileManagerProps {
  entityType: string;
  entityId: string;
  fileType: string;
  title?: string;
  allowUpload?: boolean;
  allowManage?: boolean;
  description?: string;
  multiple?: boolean;
  acceptedFileTypes?: string;
  onUploadComplete?: (fileId: string, fileUrl: string) => void;
  inputId?: string; // Added inputId prop
}

/**
 * Main component for managing files
 */
const FileManager: React.FC<FileManagerProps> = ({
  entityType,
  entityId,
  fileType,
  title,
  allowUpload = true,
  allowManage = true,
  description = '',
  multiple = true,
  acceptedFileTypes,
  onUploadComplete,
  inputId = `file-upload-${fileType}` // Generate unique ID based on fileType
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const queryClient = useQueryClient();
  // Track last upload time to force refreshes
  const [lastUploadTime, setLastUploadTime] = useState<number>(Date.now());


  // Selected file for viewing details
  const [selectedFile, setSelectedFile] = useState<FileEntity | null>(null);

  // Handle file selection
  const handleFileSelected = (file: FileEntity) => {
    if (allowManage) {
      setSelectedFile(file);
    }
  };

  // Handle successful upload
  const handleUploadComplete = (fileId: string, fileUrl: string) => {
    // Invalidate queries to refresh file list
    queryClient.invalidateQueries({
      queryKey: ['files', entityType, entityId]
    });

    if (fileType) {
      queryClient.invalidateQueries({
        queryKey: ['files', entityType, entityId, fileType]
      });
    }

    // Invalidate file versions if we have a fileId
    if (fileId) {
      queryClient.invalidateQueries({
        queryKey: ['fileVersions', fileId]
      });
    }

    // Invalidate all file version queries to ensure everything is refreshed
    queryClient.invalidateQueries({
      queryKey: ['fileVersions']
    });

    // Force refresh by updating the lastUploadTime
    setLastUploadTime(Date.now());

    // Call the provided callback if available
    if (onUploadComplete) {
      onUploadComplete(fileId, fileUrl);
    }



    // Force an immediate refetch of all related queries
    setTimeout(() => {
      queryClient.invalidateQueries({ type: 'all' });

    }, 500);
  };

  return (
    <div className={`rounded-lg ${isLightMode ? 'bg-light' : 'bg-dark'} p-4 mb-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
        {title || t('Files')}
      </h2>

      {/* File Upload Section */}
      {allowUpload && (
        <div className="mb-4">
          <FileUpload
            entityType={entityType}
            entityId={entityId}
            fileType={fileType}
            description={description}
            multiple={multiple}
            onUploadComplete={handleUploadComplete}
            acceptedFileTypes={acceptedFileTypes}
            inputId={inputId}
          />
        </div>
      )}

      {/* File List Section */}
      <div className="mb-4">
        <FileList
          entityType={entityType}
          entityId={entityId}
          fileType={fileType}
          viewOnly={!allowManage}
          onFileSelected={handleFileSelected}
          key={`file-list-${entityType}-${entityId}-${fileType}-${lastUploadTime}`} // Force re-render when lastUploadTime changes
        />
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <FileDetails
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
              onDelete={() => {
                // Refresh file list after deletion
                handleUploadComplete("", "");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;