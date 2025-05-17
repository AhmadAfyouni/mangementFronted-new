import { useState, useRef } from 'react';
import Image from 'next/image';
import { PaperClipIcon } from '@/assets';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { useFileUpload } from '@/hooks/fileManager';
import useSnackbar from '@/hooks/useSnackbar';
import { FileObject } from '@/types/FileManager.type';

interface FileUploadProps {
  entityType: string;
  entityId: string;
  fileType: string;
  description?: string;
  multiple?: boolean;
  onUploadComplete?: (fileId: string, fileUrl: string) => void;
  buttonText?: string;
  acceptedFileTypes?: string;
  inputId?: string; // Added inputId prop for unique identification
}

/**
 * Component for uploading files
 */
const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  fileType,
  description = '',
  multiple = false,
  onUploadComplete,
  buttonText,
  acceptedFileTypes,
  inputId = 'file-upload-input' // Default value for backward compatibility
}) => {
  // Console log for debugging
  console.log(`FileUpload component initialized with fileType: ${fileType || 'not specified'}`);
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { setSnackbarConfig: showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for tracking selected files before upload
  const [selectedFiles, setSelectedFiles] = useState<FileObject[]>([]);

  // Upload hook
  const {
    uploadFileAsync,
    isUploading,
    uploadError
  } = useFileUpload();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`File selected in input with ID: ${inputId}, fileType: ${fileType}`);
    
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: FileObject[] = Array.from(e.target.files).map(file => ({
        name: file.name,
        file: file
      }));

      setSelectedFiles(filesArray);

      // If not using multiple file selection, upload immediately
      if (!multiple && filesArray.length === 1) {
        handleUpload(filesArray);
      }
    }
  };

  // Handle file upload
  const handleUpload = async (files: FileObject[] = selectedFiles) => {
    if (files.length === 0) {
      showSnackbar({
        open: true, 
        message: t('Please select a file to upload'),
        severity: 'warning'
      });
      return;
    }

    try {
      // Log the fileType being used for upload
      console.log(`Uploading file with fileType: ${fileType || 'not specified'}`);
      
      // Show loading spinner during upload
      showSnackbar({
        open: true, 
        message: t('Uploading file...'),
        severity: 'info'
      });
      
      // Upload each file
      for (const fileObj of files) {
        const result = await uploadFileAsync({
          file: fileObj.file,
          name: fileObj.name,
          entityType,
          entityId,
          fileType, // Using the fileType as passed from the parent component
          description
        });
        
        console.log(`Upload completed with fileType: ${fileType || 'not specified'}`);
        console.log('Upload result:', result);

        // Force immediate UI refresh
        if (result?.data?.fileId) {
          // Show success notification
          showSnackbar({
            open: true, 
            message: t('File uploaded successfully'),
            severity: 'success'
          });
          
          console.log('Triggering onUploadComplete with file ID:', result.data.fileId);
          // Call callback if provided
          if (onUploadComplete) {
            onUploadComplete(
              result.data.fileId,
              result.data.fileUrl
            );
          }
        }
      }

      // Clear selection
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar({

        open: true, message: t('Error uploading file'),
        severity: 'error'
      });
    }
  };

  // Clear file selection
  const handleClearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
          multiple={multiple}
          accept={acceptedFileTypes}
          disabled={isUploading}
        />
        <label
          htmlFor={inputId}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
            ${isLightMode
              ? "bg-secondary text-twhite"
              : "bg-tblack text-twhite"
            }
            hover:bg-secondary transition-colors
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Image
            src={PaperClipIcon}
            alt="paperclip icon"
            width={16}
            height={16}
          />
          <span>
            {buttonText || (isUploading ? t('Uploading...') : t('Select File'))}
          </span>
        </label>

        {multiple && selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={() => handleUpload()}
            disabled={isUploading}
            className={`
              px-3 py-2 rounded-md
              ${isLightMode ? "bg-green-600" : "bg-green-700"}
              text-white
              ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500"}
              transition-colors
            `}
          >
            {isUploading ? t('Uploading...') : t('Upload Selected Files')}
          </button>
        )}

        <span className="text-sm text-tdark ml-2">
          {selectedFiles.length > 0
            ? t('{{count}} files selected', { count: selectedFiles.length })
            : t('No file selected')}
        </span>
      </div>

      {uploadError && (
        <p className="text-red-500 text-sm mt-1">
          {t('Upload error')}: {uploadError.message}
        </p>
      )}

      {/* Display selected files */}
      {selectedFiles.length > 0 && multiple && (
        <div className="mt-3">
          <h4 className="text-sm text-tdark mb-2">
            {t('Selected Files')}:
          </h4>
          <div className="gap-2 max-h-40 overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`rounded-md mb-2 ${isLightMode ? "bg-light-droppable-fade" : "bg-tblack"}`}
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2 truncate flex-1">
                    <svg
                      className="h-5 w-5 text-tmid"
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
                    <span className="text-twhite text-sm truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-tdark whitespace-nowrap">
                      {(file.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...selectedFiles];
                      newFiles.splice(index, 1);
                      setSelectedFiles(newFiles);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    disabled={isUploading}
                    title={t('Remove file')}
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
              </div>
            ))}

            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-sm text-red-400 hover:text-red-300 mt-2"
              >
                {t('Clear selection')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;