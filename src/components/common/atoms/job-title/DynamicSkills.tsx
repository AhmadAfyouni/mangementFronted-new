// DynamicSkills.tsx
import React from "react";
import { Plus, X } from "lucide-react";
import useCustomTheme from "@/hooks/useCustomTheme";
import { JobCategoryFormInputs } from "@/types/JobCategory.type";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import useLanguage from "@/hooks/useLanguage";

interface DynamicSkillsProps {
  skills: string[];
  setSkills: (value: string[]) => void;
  register: UseFormRegister<JobCategoryFormInputs>;
  setValue: UseFormSetValue<JobCategoryFormInputs>;
  errors: FieldErrors;
}

const DynamicSkills: React.FC<DynamicSkillsProps> = ({
  skills,
  setSkills,
  setValue,
  errors,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const handleAddSkill = () => {
    setSkills([...skills, ""]);
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    setValue("required_skills", newSkills);
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
    const filteredSkills = newSkills.filter((skill) => skill.trim() !== "");
    setValue("required_skills", filteredSkills);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        {t("Required Skills")}
      </label>
      {skills.map((skill, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            defaultValue={skill}
            onChange={(e) => handleSkillChange(index, e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg outline-none border-none focus:ring-2 focus:ring-accent
              ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"}
              ${errors.required_skills ? "border-red-500" : "border-border"}`}
            placeholder={t("Enter skill here")}
          />
          <button
            type="button"
            onClick={() => handleRemoveSkill(index)}
            className={`p-2 rounded-lg hover:bg-red-500/20
              ${isLightMode ? "text-red-400" : "text-red-500"}`}
          >
            <X size={20} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddSkill}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg
          ${
            isLightMode
              ? "bg-dark hover:bg-darker text-tblackAF"
              : "bg-secondary hover:bg-slate-700 text-twhite"
          }`}
      >
        <Plus size={20} />
        {t("Add Skill")}
      </button>
      {errors.required_skills && (
        <p className="text-red-500 mt-1 text-sm">
          {errors.required_skills.message as string}
        </p>
      )}
    </div>
  );
};

export default DynamicSkills;
