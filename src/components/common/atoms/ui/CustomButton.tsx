import { ButtonProps } from "@/types/new-template.type";

// Custom Button Component
export const CustomButton: React.FC<ButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";

  return (
    <button
      {...props}
      className={`${baseStyles} bg-dark hover:bg-secondary text-twhite ${className}`}
    >
      {children}
    </button>
  );
};
