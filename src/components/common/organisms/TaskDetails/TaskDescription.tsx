import { FileText } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

interface TaskDescriptionProps {
  description: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({ description, onChange, isEditing }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        {t("Description")}
      </h2>
      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 bg-dark rounded-lg text-twhite border border-gray-700 transition-colors ${isEditing
            ? 'focus:border-blue-500 focus:outline-none cursor-text'
            : 'cursor-default border-transparent'
          }`}
        rows={5}
        placeholder={t("What is this task about?")}
        readOnly={!isEditing}
      />
    </div>
  );
};
