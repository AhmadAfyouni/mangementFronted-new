import React from "react";
import Image from "next/image";
import { XIcon } from "@/assets";
import { UseFormRegister } from "react-hook-form";
import { DepartmentFormInputs } from "@/types/DepartmentType.type";

type InputType = "text" | "number" | "email" | "password" | "file" | "select";

interface SelectOption {
  value: string | number;
  label: string;
}

interface BaseProps {
  label?: string;
  type?: InputType;
  error?: string;
  isLightMode: boolean;
  placeholder?: string;
  registerName: keyof DepartmentFormInputs;
  isTextArea?: boolean;
  className?: string;
  rows?: number;
  disabled?: boolean;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  index?: number;
}

interface SelectProps extends BaseProps {
  type: "select";
  selectOptions: SelectOption[];
  showAddButton?: boolean;
  onAddClick?: () => void;
}

interface RemovableInputProps extends BaseProps {
  showRemoveButton?: boolean;
  onRemove?: (index: number) => void;
}

interface AddButtonProps {
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
}

interface RegisterProps {
  register?: UseFormRegister<DepartmentFormInputs>;
}

type DeptFormInputProps = SelectProps &
  AddButtonProps &
  RegisterProps &
  RemovableInputProps;

const DeptFormInput: React.FC<DeptFormInputProps> = ({
  label,
  type = "text",
  error,
  isLightMode,
  register,
  placeholder,
  registerName,
  isTextArea = false,
  selectOptions = [],
  onAddClick,
  onRemove,
  showAddButton = false,
  addButtonLabel = "",
  className = "",
  rows = 1,
  disabled = false,
  value,
  onChange,
  index,
  showRemoveButton = false,
}) => {
  const baseInputStyles = `w-full px-4 py-2 mt-1 rounded-lg border-none outline-none ${
    isLightMode ? "bg-dark placeholder:text-tdark" : "bg-secondary"
  }`;

  const renderInput = () => {
    if (isTextArea) {
      return (
        <textarea
          {...(register ? register(registerName) : {})}
          className={`${baseInputStyles} ${className}`}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
      );
    }

    if (type === "select") {
      return (
        <div className="flex gap-2 items-center">
          <select
            {...(register ? register(registerName) : {})}
            className={`${baseInputStyles} ${className}`}
            disabled={disabled}
            onChange={onChange}
          >
            <option value="">{placeholder}</option>
            {selectOptions.map((option, idx) => (
              <option
                key={idx}
                value={typeof option === "string" ? option : option.value}
                selected={value == option.value}
              >
                {typeof option === "string" ? option : option.label}
              </option>
            ))}
          </select>
          {showAddButton && (
            <div
              onClick={onAddClick}
              className="mt-1 border-gray-500 border-dashed border-2 text-center rounded-md w-[45px] h-[40px] content-center text-lg font-bold cursor-pointer"
            >
              +
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-center">
        <input
          type={type}
          {...(register ? register(registerName) : {})}
          className={`${baseInputStyles} ${className}`}
          placeholder={placeholder}
          disabled={disabled}
          defaultValue={value}
          onChange={onChange}
        />
        {showRemoveButton && (
          <Image
            src={XIcon}
            alt="remove"
            width={30}
            height={30}
            className="bg-main cursor-pointer p-1 shadow-md rounded-md text-red-500"
            onClick={() => onRemove?.(index ?? -1)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-tmid block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      {renderInput()}
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
      {showAddButton && addButtonLabel && (
        <button
          type="button"
          onClick={onAddClick}
          className="text-sm text-tbright underline mt-2"
        >
          {addButtonLabel}
        </button>
      )}
    </div>
  );
};

export default DeptFormInput;
