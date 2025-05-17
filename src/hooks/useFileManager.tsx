import {
  useFileDelete,
  useFilesByEntity,
  useFileUpload,
  useFileVersions,
  useSetCurrentVersion,
  useVersionDelete
} from '@/hooks/fileManager';
import useLanguage from '@/hooks/useLanguage';
import useSnackbar from '@/hooks/useSnackbar';
import { FileEntity, FileObject } from '@/types/FileManager.type';
import { useState } from 'react';

interface UseFileManagerProps {
  entityType: string;
  entityId: string;
  fileType?: string;
}

/**
 * Combined hook for complete file management functionality
 */
export const useFileManager = ({
  entityType,
  entityId,
  fileType
}: UseFileManagerProps) => {
  const { t } = useLanguage();
  const { setSnackbarConfig } = useSnackbar();

  // State for selected file and version
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Fetch files query
  const filesQuery = useFilesByEntity(entityType, entityId, fileType ?? "");

  // Fetch versions query - only enabled if a file is selected
  const versionsQuery = useFileVersions(
    selectedFileId || '',
    !!selectedFileId
  );

  // File upload mutation
  const {
    uploadFileAsync,
    isUploading,
    uploadError
  } = useFileUpload();

  // File delete mutation
  const {
    deleteFileAsync,
    isDeleting,
    deleteError
  } = useFileDelete();

  // Version delete mutation
  const {
    deleteVersionAsync,
    isDeletingVersion
  } = useVersionDelete();

  // Set current version mutation
  const {
    setCurrentVersionAsync,
    isSetting
  } = useSetCurrentVersion();

  // Helper function to select a file
  const selectFile = (fileId: string) => {
    setSelectedFileId(fileId);
  };

  // Helper function to get the selected file
  const getSelectedFile = (): FileEntity | undefined => {
    if (!selectedFileId || !filesQuery.data?.data?.files) return undefined;
    return filesQuery.data.data.files.find(f => f.id === selectedFileId);
  };

  // Upload a file
  const uploadFile = async (fileObject: FileObject, description?: string) => {
    try {
      const result = await uploadFileAsync({
        file: fileObject.file,
        name: fileObject.name,
        entityType,
        entityId,
        fileType: fileType || 'document',
        description
      });

      setSnackbarConfig({

        open: true, message: t('File uploaded successfully'),
        severity: 'success'
      });

      return result.data;
    } catch (error) {
      setSnackbarConfig({

        open: true, message: t('Error uploading file'),
        severity: 'error'
      });
      throw error;
    }
  };

  // Delete a file
  const deleteFile = async (fileId: string) => {
    try {
      const result = await deleteFileAsync({
        fileId,
        entityType,
        entityId
      });

      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }

      setSnackbarConfig({

        open: true, message: t('File deleted successfully'),
        severity: 'success'
      });

      return result;
    } catch (error) {
      setSnackbarConfig({

        open: true, message: t('Error deleting file'),
        severity: 'error'
      });
      throw error;
    }
  };

  // Delete a file version
  const deleteVersion = async (versionId: string, fileId: string) => {
    try {
      const result = await deleteVersionAsync({
        versionId,
        fileId
      });

      setSnackbarConfig({

        open: true, message: t('Version deleted successfully'),
        severity: 'success'
      });

      return result;
    } catch (error) {
      setSnackbarConfig({

        open: true, message: t('Error deleting version'),
        severity: 'error'
      });
      throw error;
    }
  };

  // Set current version
  const setCurrentVersion = async (versionId: string, fileId: string) => {
    try {
      const result = await setCurrentVersionAsync({
        versionId,
        fileId
      });

      setSnackbarConfig({

        open: true, message: t('Version set as current successfully'),
        severity: 'success'
      });

      return result;
    } catch (error) {
      setSnackbarConfig({

        open: true, message: t('Error setting current version'),
        severity: 'error'
      });
      throw error;
    }
  };

  return {
    // Queries
    files: filesQuery.data?.data?.files || [],
    fileVersions: versionsQuery.data?.data?.versions || [],
    isLoadingFiles: filesQuery.isLoading,
    isLoadingVersions: versionsQuery.isLoading,
    filesError: filesQuery.error,
    versionsError: versionsQuery.error,

    // Mutations
    uploadFile,
    deleteFile,
    deleteVersion,
    setCurrentVersion,
    isUploading,
    isDeleting,
    isDeletingVersion,
    isSetting,
    uploadError,
    deleteError,

    // State management
    selectedFileId,
    selectFile,
    getSelectedFile,

    // Refetch functions
    refetchFiles: filesQuery.refetch,
    refetchVersions: versionsQuery.refetch
  };
};

export default useFileManager;