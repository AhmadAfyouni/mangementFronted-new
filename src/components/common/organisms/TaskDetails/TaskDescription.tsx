import { FileText, Edit3, Eye } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

interface TaskDescriptionProps {
  description: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  description,
  onChange,
  isEditing
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-secondary rounded-lg border border-gray-700 flex flex-col h-full">
      {/* Compact Header */}
      <div className="bg-dark/30 px-4 py-3 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-bold text-twhite flex items-center gap-2">
          <div className="p-1.5 rounded bg-purple-500/20">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          {t("Description")}
        </h3>

        {/* Compact Edit indicator */}
        {isEditing ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
            <Edit3 className="w-3 h-3" />
            {t("Edit")}
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
            <Eye className="w-3 h-3" />
            {t("View")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {!description && !isEditing ? (
          /* Empty state when no description and not editing */
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-gray-700/30 mb-4">
              <FileText className="w-8 h-8 text-gray-500 opacity-50" />
            </div>
            <p className="text-gray-400 text-sm mb-2">{t("No description has been added to this task yet")}</p>
            <p className="text-gray-500 text-xs">{t("Click edit to add a description")}</p>
          </div>
        ) : (
          /* Text area when editing or when description exists */
          <div className="flex-1 relative">
            <textarea
              value={description}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full h-full p-3 bg-dark rounded-lg text-twhite border transition-all duration-200 resize-none ${isEditing
                ? 'border-gray-600 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400/20 cursor-text hover:border-gray-500'
                : 'border-gray-700/50 cursor-default hover:bg-dark'
                }`}
              placeholder={isEditing ? t("Describe what this task is about...") : t("No description provided")}
              readOnly={!isEditing}
              style={{ minHeight: '200px' }}
            />

            {/* Character count for editing mode */}
            {isEditing && description && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-dark/80 px-2 py-1 rounded">
                {description.length} {t("characters")}
              </div>
            )}
          </div>
        )}

        {/* Help text for editing mode */}
        {isEditing && (
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            {t("Provide a clear description to help team members understand the task objectives")}
          </div>
        )}
      </div>
    </div>
  );
};