import React from "react";
import { UserCog } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import useCustomTheme from "@/hooks/useCustomTheme";

type IsManagerToggleProps = {
  isManager: boolean;
  setIsManager: (value: boolean) => void;
};

const IsManagerToggle: React.FC<IsManagerToggleProps> = ({
  isManager,
  setIsManager,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl ${
        isLightMode ? "bg-dark/5" : "bg-secondary/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isLightMode ? "bg-darker/10" : "bg-dark/40"
          }`}
        >
          <UserCog size={20} className="text-primary" />
        </div>
        <div>
          <label className="font-medium">{t("Is Manager?")}</label>
          <p
            className={`text-sm ${
              isLightMode ? "text-tblack/60" : "text-tmid/60"
            }`}
          >
            {t("Enable management privileges for this role")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsManager(!isManager)}
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${isManager ? "bg-green-500" : "bg-red-500"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200
            ${isManager ? "translate-x-6" : "translate-x-0"} shadow-sm
          `}
        />
      </button>
    </div>
  );
};

export default IsManagerToggle;
