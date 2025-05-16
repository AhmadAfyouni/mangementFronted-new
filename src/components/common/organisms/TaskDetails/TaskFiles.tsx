import { Paperclip, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import { FileManager } from '@/components/common/atoms/fileManager';
import useCustomTheme from "@/hooks/useCustomTheme";
import { useState } from "react";
import { constructFileUrl, isFileManagerUrl, getFilenameFromUrl } from '@/utils/url';

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

  // File management server URL (used for new file system)
  const fileManagerServerUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || "";

  // Function to handle file viewing with error handling
  const handleFileView = (file: string) => {
    if (!onViewFile) return;

    try {
      // Make sure to use the constructed URL with base URL when needed
      // The file URL passed to this function should already have been constructed properly
      onViewFile(file);
    } catch (error) {
      console.error("Error viewing file:", error);
      setLoadingError(true);
    }
  };

  if (!taskId) {
    return (
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-yellow-400" />
          {t("Task Files")}
        </h2>
        <p className="text-gray-400 text-center py-8">
          {t("Task ID is required to view files.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <Paperclip className="w-5 h-5 text-yellow-400" />
        {t("Task Files")}
      </h2>

      {/* New File Management System */}
      <FileManager
        entityType="task"
        entityId={taskId}
        allowManage={true}
        allowUpload={true}
      />

      {/* Legacy Files Display */}
      {files && files.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-twhite mb-2 flex items-center gap-2">
            {t("Legacy Files")}
            {loadingError && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t("Some files may not load correctly")}
              </span>
            )}
          </h3>

          <div className="space-y-2">
            {files.map((file, index) => {
              // Check if the file URL is from the file management server
              const isFromFileManager = isFileManagerUrl(file);

              // Handle file path correctly
              const fileUrl = constructFileUrl(file);

              // Extract filename from the path
              const fileName = getFilenameFromUrl(file) || `File ${index + 1}`;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-dark rounded-lg group hover:bg-darker transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Paperclip className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span className="text-twhite truncate max-w-[300px]">
                      {fileName}
                    </span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isFromFileManager ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                      }`}>
                      {isFromFileManager ? t("File Manager") : t("Legacy")}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onViewFile && (
                      <button
                        onClick={() => handleFileView(fileUrl)}
                        disabled={isLoadingFile === file}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${isLoadingFile === file
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {isLoadingFile === file ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                            {t("Loading...")}
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            {t("View")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error state for no files */}
      {(!files || files.length === 0) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-twhite mb-2">
            {t("Legacy Files")}
          </h3>
          <div className="bg-dark rounded-lg p-4 text-center">
            <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">
              {loadingError
                ? t("Error loading files. Network error or files may be unavailable.")
                : t("No legacy files attached to this task.")}
            </p>
            {loadingError && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                {t("Refresh page")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
