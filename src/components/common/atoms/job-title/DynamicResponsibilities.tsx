// DynamicResponsibilities.tsx
import React from "react";
import { Plus, X } from "lucide-react";
import useCustomTheme from "@/hooks/useCustomTheme";
import { JobTitleFormInputs } from "@/types/JobTitle.type";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import useLanguage from "@/hooks/useLanguage";

interface DynamicResponsibilitiesProps {
  responsibilities: string[];
  setResponsibilities: (value: string[]) => void;
  register: UseFormRegister<JobTitleFormInputs>;
  setValue: UseFormSetValue<JobTitleFormInputs>;
  errors: FieldErrors;
}

const DynamicResponsibilities: React.FC<DynamicResponsibilitiesProps> = ({
  responsibilities,
  setResponsibilities,
  setValue,
  errors,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const handleAddResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const handleRemoveResponsibility = (index: number) => {
    const newResponsibilities = responsibilities.filter((_, i) => i !== index);
    setResponsibilities(newResponsibilities);
    setValue("responsibilities", newResponsibilities);
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...responsibilities];
    newResponsibilities[index] = value;
    setResponsibilities(newResponsibilities);
    setValue("responsibilities", newResponsibilities);
  };

  return (
    <div className="gap-3">
      <label className="block text-sm font-medium">
        {t("Responsibilities")}
      </label>
      {responsibilities.map((responsibility, index) => (
        <div key={index} className="flex gap-2 items-center">
          <textarea
            defaultValue={responsibility}
            onChange={(e) => handleResponsibilityChange(index, e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg outline-none border-none focus:ring-2 focus:ring-accent
              ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"}
              ${errors.responsibilities ? "border-red-500" : "border-border"}`}
            placeholder={t("Enter responsibility here")}
          />
          <button
            type="button"
            onClick={() => handleRemoveResponsibility(index)}
            className={`p-2 rounded-lg hover:bg-red-500/20 
              ${isLightMode ? "text-red-400" : "text-red-500"}`}
          >
            <X size={20} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddResponsibility}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg 
          ${isLightMode
            ? "bg-dark hover:bg-darker text-tblackAF"
            : "bg-secondary hover:bg-slate-700 text-twhite"
          }`}
      >
        <Plus size={20} />
        {t("Add Responsibility")}
      </button>
      {errors.responsibilities && (
        <p className="text-red-500 mt-1 text-sm">
          {errors.responsibilities.message as string}
        </p>
      )}
    </div>
  );
};

export default DynamicResponsibilities;
