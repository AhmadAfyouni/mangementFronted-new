import { TextareaProps } from "@/types/new-template.type";

// Custom Textarea Component
export const CustomTextarea: React.FC<TextareaProps> = ({
  label,
  className = "",
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-twhite">{label}</label>
    <textarea
      {...props}
      className={`w-full px-4 py-2 bg-secondary border border-gray-300 dark:border-gray-700  text-twhite
      rounded-lg focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent 
      placeholder:text-tmid
      transition-colors duration-200 min-h-[120px] resize-y ${className}`}
    />
  </div>
);
