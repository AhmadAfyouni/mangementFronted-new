import useCustomTheme from "@/hooks/useCustomTheme";
import { JobTitleFormInputs } from "@/types/JobTitle.type";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface TitleFormInputProps {
  name: keyof JobTitleFormInputs;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  options?: { id: string; name: string }[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  errors: FieldErrors;
  register: UseFormRegister<JobTitleFormInputs>;
  selectedOption?: string;
  isRequired?: boolean;
}

const TitleFormInput = ({
  name,
  label,
  placeholder,
  type = "text",
  options = [],
  onChange,
  errors,
  register,
  selectedOption,
  isRequired = false,
}: TitleFormInputProps) => {
  const { isLightMode } = useCustomTheme();
  return (
    <div>
      <label className="block text-sm font-medium">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          {...register(name)}
          className={`w-full px-4 py-2 mt-1 rounded-lg outline-none border-none focus:ring-2 focus:ring-accent border 
            ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} 
            ${errors[name] ? "border-red-500" : "border-border"}`}
          placeholder={placeholder}
          rows={3}
        />
      ) : type === "select" ? (
        <select
          {...register(name)}
          className={`w-full px-4 py-2 mt-1 rounded-lg outline-none border-none focus:ring-2 focus:ring-accent border 
            ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} 
            ${errors[name] ? "border-red-500" : "border-border"}`}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options &&
            options.map((option) => (
              <option
                key={option.id}
                value={option.id}
                selected={selectedOption == option.id}
              >
                {option.name}
              </option>
            ))}
        </select>
      ) : (
        <input
          type="text"
          {...register(name)}
          className={`w-full px-4 py-2 mt-1 rounded-lg outline-none border-none focus:ring-2 focus:ring-accent border 
            ${isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"} 
            ${errors[name] ? "border-red-500" : "border-border"}`}
          placeholder={placeholder}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 mt-1 text-sm">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default TitleFormInput;
