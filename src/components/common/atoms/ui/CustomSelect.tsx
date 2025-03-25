import { SelectProps } from "@/types/new-template.type";

// Custom Select Component
export const CustomSelect: React.FC<SelectProps> = ({
  label,
  options,
  className = "",
  placeholder = "",
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-twhite">{label}</label>
    <select
      {...props}
      className={`w-full px-4 py-2 bg-secondary border border-gray-300 dark:border-gray-700 
      rounded-lg focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent 
      transition-colors duration-200 appearance-none cursor-pointer text-twhite
      [&>option]:bg-secondary [&>option]:text-twhite 
      [&>option:hover]:bg-main [&>option:focus]:bg-main ${className}`}
    >
      <option value="">{placeholder || "Select an option"}</option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-secondary text-twhite hover:bg-main"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
