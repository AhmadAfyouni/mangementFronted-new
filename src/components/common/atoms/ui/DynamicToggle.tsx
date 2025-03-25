import React from "react";
import { UserCog } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import useCustomTheme from "@/hooks/useCustomTheme";

type ToggleProps = {
  label: string;
  description: string;
  icon?: React.ElementType;
  value: boolean;
  setValue: (value: boolean) => void;
};

const DynamicToggle: React.FC<ToggleProps> = ({
  label,
  description,
  icon: Icon = UserCog,
  value,
  setValue,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl ${
        isLightMode ? "bg-dark" : "bg-secondary"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-tblack`}>
          <Icon size={20} className="text-tmid" />
        </div>
        <div>
          <label className="font-medium text-tmid">{t(label)}</label>
          <p className={`text-sm text-tmid`}>{t(description)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setValue(!value)}
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${value ? "bg-green-500" : "bg-red-500"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200
            ${value ? "translate-x-6" : "translate-x-0"} shadow-sm
          `}
        />
      </button>
    </div>
  );
};

export default DynamicToggle;
