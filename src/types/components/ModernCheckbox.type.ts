import { MultiValue } from "react-select";

export interface Option {
  label: string;
  value: string;
}

export interface ModernCheckboxProps {
  options: Option[];
  defaultSelected?: Option[];
  placeholder?: string; // New prop for dynamic placeholder
  onChange: (selectedOptions: MultiValue<Option>) => void; // Add onChange prop to the interface
}
