import { Paperclip } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

interface TaskFilesProps {
  files?: string[];
  onViewFile: (file: string) => void;
  isLoadingFile?: string | null;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({ files, onViewFile, isLoadingFile }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <Paperclip className="w-5 h-5 text-yellow-400" />
        {t("Task Files")}
      </h2>
      {files && files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-dark rounded-lg group hover:bg-gray-800 transition-colors"
            >
              <span className="text-twhite truncate">{file.split("/").pop()}</span>
              <button
                onClick={() => onViewFile(file)}
                disabled={isLoadingFile === file}
                className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLoadingFile === file ? t("Loading...") : t("View")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">{t("No files attached to this task.")}</p>
      )}
    </div>
  );
};
