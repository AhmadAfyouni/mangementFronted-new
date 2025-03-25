/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ReactNode } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  Path,
  FieldValues,
} from "react-hook-form";

interface CommonInputProps<TFieldValues extends FieldValues> {
  // Core input properties
  label: string;
  name: Path<TFieldValues>;
  type?: "text" | "textarea" | "select" | "skills";

  // Form hook properties
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  setValue?: UseFormSetValue<TFieldValues>;

  // Styling and theming
  isLightMode?: boolean;
  t: (key: string) => string;

  // Input configuration
  placeholder?: string;
  defaultValue?: string;
  rows?: number;

  // Select and dynamic option properties
  options?: string[];
  onAddOption?: (newOption: string) => Promise<void> | void;

  // Custom rendering and transformation
  renderLabel?: (label: string) => ReactNode;
  renderInput?: (props: CommonInputRenderProps<TFieldValues>) => ReactNode;
  valueTransformer?: (value: string) => any;

  // Additional customization
  additionalClassName?: string;
  addButtonClassName?: string;
  errorClassName?: string;
}

interface CommonInputRenderProps<TFieldValues extends FieldValues>
  extends Omit<CommonInputProps<TFieldValues>, "renderInput"> {
  baseClasses: string;
  errorClasses: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  isAddingOption: boolean;
  setIsAddingOption: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormInput = <TFieldValues extends FieldValues>({
  label,
  name,
  type = "text",
  register,
  errors,
  setValue,
  isLightMode = false,
  t,
  placeholder,
  defaultValue = "",
  rows = 3,
  options = [],
  onAddOption,
  renderLabel,
  renderInput,
  valueTransformer,
  additionalClassName = "",
  addButtonClassName = "",
  errorClassName = "",
}: CommonInputProps<TFieldValues>) => {
  // State for managing dynamic option adding
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOption, setNewOption] = useState("");

  // Base styling classes
  const baseClasses = `w-full px-4 py-2 mt-1 ${
    isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"
  } outline-none border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border`;

  const errorClasses = errors[name] ? "border-high" : "border-border";

  // Handling option addition
  const handleAddOption = async () => {
    if (onAddOption) {
      await onAddOption(newOption);
      setNewOption("");
      setIsAddingOption(false);
    }
  };

  // Change handler with optional value transformation
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value = e.target.value;

    // Optional value transformation
    if (setValue) {
      const finalValue = valueTransformer ? valueTransformer(value) : value;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue(name, finalValue as any);
    }
  };

  // Default render label function
  const defaultRenderLabel = () => (
    <label className="block text-sm font-medium">{t(label)}</label>
  );

  // Default input rendering based on type
  const defaultRenderInput = (props: CommonInputRenderProps<TFieldValues>) => {
    const { baseClasses, errorClasses, additionalClassName, type } = props;

    switch (type) {
      case "textarea":
        return (
          <textarea
            {...register(name)}
            className={`${baseClasses} ${errorClasses} ${additionalClassName}`}
            placeholder={placeholder}
            rows={rows}
            defaultValue={defaultValue}
            onChange={props.handleChange}
          />
        );

      case "select":
        return (
          <>
            <div className="flex gap-2 items-center">
              <select
                {...register(name)}
                className={`${baseClasses} ${errorClasses} ${additionalClassName}`}
                defaultValue={defaultValue}
                onChange={props.handleChange}
              >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {onAddOption && (
                <div
                  onClick={() => props.setIsAddingOption(true)}
                  className={`mt-1 border-gray-500 border-dashed border-2 text-center rounded-md w-[45px] h-[40px] content-center text-lg font-bold cursor-pointer ${addButtonClassName}`}
                >
                  +
                </div>
              )}
            </div>

            {props.isAddingOption && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  className={`${baseClasses}`}
                  placeholder={t("Enter new option")}
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-dark hover:bg-main text-twhite rounded-md px-4 py-2"
                >
                  {t("Add")}
                </button>
              </div>
            )}
          </>
        );
      case "skills":
        return (
          <textarea
            {...register(name, {
              setValueAs: (value) =>
                value && value.toString().length > 0
                  ? value.split(",").map((skill: string) => skill.trim())
                  : [],
            })}
            className={`${baseClasses} ${errorClasses} ${additionalClassName}`}
            placeholder={placeholder}
            rows={rows}
            defaultValue={defaultValue}
          />
        );
      default:
        return (
          <input
            type="text"
            {...register(name)}
            className={`${baseClasses} ${errorClasses} ${additionalClassName}`}
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChange={props.handleChange}
          />
        );
    }
  };

  // Render
  return (
    <div>
      {renderLabel ? renderLabel(label) : defaultRenderLabel()}

      {renderInput
        ? renderInput({
            label,
            name,
            type,
            register,
            errors,
            setValue,
            isLightMode,
            t,
            placeholder,
            defaultValue,
            rows,
            options,
            onAddOption,
            baseClasses,
            errorClasses,
            handleChange,
            isAddingOption,
            setIsAddingOption,
            additionalClassName,
          })
        : defaultRenderInput({
            label,
            name,
            type,
            register,
            errors,
            setValue,
            isLightMode,
            t,
            placeholder,
            defaultValue,
            rows,
            options,
            onAddOption,
            baseClasses,
            errorClasses,
            handleChange,
            isAddingOption,
            setIsAddingOption,
            additionalClassName,
          })}

      {errors[name] && (
        <p className={`text-red-500 mt-1 text-sm ${errorClassName}`}>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};
