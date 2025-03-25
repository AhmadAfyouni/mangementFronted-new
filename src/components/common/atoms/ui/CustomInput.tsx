import { InputProps } from "@/types/new-template.type";

export const CustomInput: React.FC<InputProps> = ({
  label,
  className = "",
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-twhite">{label}</label>
    <input
      {...props}
      className={`w-full px-4 py-2 text-twhite bg-secondary border border-gray-300 dark:border-gray-700 
      rounded-lg focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent 
      placeholder:text-tmid
      transition-colors duration-200 ${className}`}
    />
  </div>
);
