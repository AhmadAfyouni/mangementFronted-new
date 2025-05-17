import { useFileVersions, useSetCurrentVersion } from '@/hooks/fileManager';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import useSnackbar from '@/hooks/useSnackbar';
import { constructFileUrl } from '@/utils/url';
import { ExternalLink } from 'lucide-react';

interface FileVersionsProps {
  fileId: string;
}

/**
 * Component to display and manage versions of a file
 */
const FileVersions: React.FC<FileVersionsProps> = ({ fileId }) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const { setSnackbarConfig } = useSnackbar();

  // Fetch file versions
  const {
    data: versionsData,
    isLoading,
    isError
  } = useFileVersions(fileId);

  // Mutation for setting current version
  const {
    setCurrentVersion,
    isSetting
  } = useSetCurrentVersion();

  // Handle setting version as current
  const handleSetCurrentVersion = (versionId: string) => {
    setCurrentVersion(
      { versionId, fileId },
      {
        onSuccess: () => {
          setSnackbarConfig({
            open: true,
            message: t('Version set as current successfully'),
            severity: 'success'
          });
        },
        onError: (error) => {
          setSnackbarConfig({
            open: true,
            message: t('Failed to set version as current') + ': ' + error.message,
            severity: 'error'
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-3 bg-secondary rounded w-3/4"></div>
        <div className="h-3 bg-secondary rounded w-1/2"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-danger text-xs py-1">
        {t('Error loading versions')}
      </div>
    );
  }

  const versions = versionsData?.data?.versions || [];

  return (
    <div>
      {versions.length === 0 ? (
        <div className="text-center py-1 text-xs text-tmid">
          {t('No versions available')}
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`
                p-3 rounded border 
                ${version.isCurrentVersion
                  ? (isLightMode ? 'bg-secondary bg-opacity-10 border-success border-opacity-30' : 'bg-secondary bg-opacity-10 border-success border-opacity-30')
                  : (isLightMode ? 'border-gray-600' : 'border-gray-700')}
                transition-colors
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-twhite">
                    v{version.version}
                  </span>
                  {version.isCurrentVersion && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded bg-success bg-opacity-20 text-twhite">
                      {t('Current')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {!version.isCurrentVersion && (
                    <button
                      type="button"
                      onClick={() => handleSetCurrentVersion(version.id)}
                      disabled={isSetting}
                      className="text-tmid hover:text-success transition-colors  rounded hover:bg-darker flex items-center gap-2 bg-main p-2"
                      title={t('Set as current version')}
                    >
                      {t("activate")}
                    </button>
                  )}
                  <a
                    href={constructFileUrl(version.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tmid hover:text-twhite transition-colors p-1 rounded hover:bg-darker"
                    title={t('Open')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="mt-1 text-xs text-tmid">
                {new Date(version.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileVersions;