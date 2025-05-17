import { useFileDelete } from '@/hooks/fileManager';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import useSnackbar from '@/hooks/useSnackbar';
import { FileEntity } from '@/types/FileManager.type';
import { constructFileUrl } from '@/utils/url';
import { Download, ExternalLink, FileBoxIcon, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import FileVersions from './FileVersions';

interface FileDetailsProps {
  file: FileEntity;
  onClose: () => void;
  onDelete?: () => void;
}

/**
 * Component to display detailed information about a file and manage it
 */
const FileDetails: React.FC<FileDetailsProps> = ({
  file,
  onClose,
  onDelete
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { setSnackbarConfig } = useSnackbar();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Delete file hook
  const {
    deleteFileAsync,
    isDeleting
  } = useFileDelete();

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await deleteFileAsync({
        fileId: file.id,
        entityType: file.entityType,
        entityId: file.entityId
      });

      setSnackbarConfig({
        open: true,
        message: t('File deleted successfully'),
        severity: 'success'
      });

      if (onDelete) {
        onDelete();
      }

      onClose();
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbarConfig({
        open: true,
        message: t('Error deleting file'),
        severity: 'error'
      });
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`p-5 rounded-xl ${isLightMode ? 'bg-secondary' : 'bg-secondary'} border ${isLightMode ? 'border-darker' : 'border-gray-700'} shadow-md`}>
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-twhite">
          {t('File Details')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 hover:bg-dark text-tmid hover:text-twhite transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* File information */}
      <div className={`mb-4 p-4 rounded-lg ${isLightMode ? 'bg-darker' : 'bg-dark'} border ${isLightMode ? 'border-darkest' : 'border-gray-700'}`}>
        <div className="flex items-start">
          <div className="mr-3 flex-shrink-0">
            {/* Document icon placeholder instead of blue box */}
            <div className="w-20 h-20 flex items-center justify-center rounded-md bg-darker bg-opacity-80">
              <FileBoxIcon className="h-14 w-14 text-tmid" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-base mb-1 break-words text-twhite">
              {file.originalName}
            </h3>

            <div className="grid grid-cols-1 gap-1 text-xs text-tmid">
              <div>
                <span className="font-medium">{t('Created')}:</span>{' '}
                {file.createdAt ? new Date(file.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Invalid Date'}
              </div>
              <div>
                <span className="font-medium">{t('Updated')}:</span>{' '}
                {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Invalid Date'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href={constructFileUrl(file.currentVersion?.fileUrl || '')}
          download={file.originalName}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                  bg-primary hover:bg-primary-600 active:bg-primary-700
                  transition-all duration-200 font-medium text-twhite"
        >
          <Download className="h-4 w-4" />
          <span>{t('Download')}</span>
        </a>

        <a
          href={constructFileUrl(file.currentVersion?.fileUrl || '')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                  bg-dark hover:bg-darker active:bg-darkest
                  transition-all duration-200 font-medium text-twhite"
        >
          <ExternalLink className="h-4 w-4" />
          <span>{t('Open')}</span>
        </a>

        <button
          type="button"
          onClick={handleDeleteFile}
          disabled={isDeleting}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            transition-all duration-200 font-medium text-twhite
            ${confirmDelete
              ? 'bg-danger hover:bg-danger-600 active:bg-danger-700'
              : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800'
            }
            ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Trash2 className="h-4 w-4" />
          <span>
            {isDeleting
              ? t('Deleting...')
              : (confirmDelete ? t('Confirm Delete') : t('Delete'))}
          </span>
        </button>
      </div>

      {/* File versions - simplified */}
      <div className={`p-4 rounded-lg ${isLightMode ? 'bg-darker' : 'bg-dark'} border ${isLightMode ? 'border-darkest' : 'border-gray-700'}`}>
        <h3 className="font-bold text-sm mb-3 text-twhite">
          {t('File Versions')}
        </h3>
        <FileVersions fileId={file.id} />
      </div>
    </div>
  );
};

export default FileDetails;