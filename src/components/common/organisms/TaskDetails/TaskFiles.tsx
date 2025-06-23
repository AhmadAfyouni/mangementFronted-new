// Compact TaskFiles Component
import { FileManager } from '@/components/common/atoms/fileManager';
import useLanguage from '@/hooks/useLanguage';
import { constructFileUrl, getFilenameFromUrl, isFileManagerUrl } from '@/utils/url';
import { AlertCircle, ExternalLink, Paperclip, XCircle, FolderOpen } from "lucide-react";
import { useState } from "react";

interface TaskFilesProps {
  taskId: string;
  files?: string[];
  onViewFile?: (file: string) => void;
  isLoadingFile?: string | null;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({
  taskId,
  files,
  onViewFile,
  isLoadingFile
}) => {
  const { t } = useLanguage();
  const [loadingError, setLoadingError] = useState<boolean>(false);

  const handleFileView = (file: string) => {
    if (!onViewFile) return;

    try {
      onViewFile(file);
    } catch (error) {
      console.error("Error viewing file:", error);
      setLoadingError(true);
    }
  };

  if (!taskId) {
    return (
      <div className="bg-secondary rounded-lg p-4 border border-gray-700 h-full flex items-center justify-center">
        <p className="text-gray-400 text-center text-sm">
          {t("Task ID is required to view files.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg border border-gray-700 h-full">
      {/* Compact Header */}
      <div className="bg-secondary px-4 py-3 border-b border-gray-700/50">
        <h3 className="text-lg font-bold text-twhite flex items-center gap-2">
          <div className="p-1.5 rounded bg-yellow-500/20">
            <Paperclip className="w-4 h-4 text-yellow-400" />
          </div>
          {t("Files")}
          {files && files.length > 0 && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
              {files.length} {t("legacy")}
            </span>
          )}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 h-full overflow-auto">
        {/* New File Management System - Compact */}
        <div className="bg-dark rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{t("File Manager")}</span>
          </div>
          <FileManager
            fileType=''
            entityType="task"
            entityId={taskId}
            allowManage={true}
            allowUpload={true}
          />
        </div>

        {/* Legacy Files - Compact Display */}
        {files && files.length > 0 && (
          <div className="bg-dark rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">{t("Legacy Files")}</span>
              </div>
              {loadingError && (
                <span className="text-xs text-amber-500">{t("Loading issues")}</span>
              )}
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {files.map((file, index) => {
                const isFromFileManager = isFileManagerUrl(file);
                const fileUrl = constructFileUrl(file);
                const fileName = getFilenameFromUrl(file) || `File ${index + 1}`;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark rounded border border-gray-700/30 hover:bg-dark transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Paperclip className="h-3 w-3 flex-shrink-0 text-yellow-400" />
                      <span className="text-twhite text-sm truncate">{fileName}</span>
                    </div>

                    {onViewFile && (
                      <button
                        onClick={() => handleFileView(fileUrl)}
                        disabled={isLoadingFile === file}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${isLoadingFile === file
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {isLoadingFile === file ? (
                          <div className="w-3 h-3 border border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state for legacy files */}
        {(!files || files.length === 0) && (
          <div className="bg-dark rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">{t("Legacy Files")}</span>
            </div>
            <div className="text-center py-4">
              <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
              <p className="text-gray-400 text-xs">
                {loadingError
                  ? t("Error loading files. Network error or files may be unavailable.")
                  : t("No legacy files attached to this task.")}
              </p>
              {loadingError && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  {t("Refresh page")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};