import useCustomTheme from "@/hooks/useCustomTheme";
import { Option } from "@/types/new-template.type";
import Select, {
  ControlProps,
  GroupBase,
  OptionProps,
  Props as SelectProps,
  StylesConfig,
} from "react-select";

type CustomReactSelectProps<IsMulti extends boolean = false> = Omit<
  SelectProps<Option, IsMulti, GroupBase<Option>>,
  "theme"
> & {
  label?: string;
};

export const CustomReactSelect = <IsMulti extends boolean = false>({
  label,
  ...props
}: CustomReactSelectProps<IsMulti>) => {
  const { isLightMode } = useCustomTheme();

  const selectStyles: StylesConfig<Option, IsMulti, GroupBase<Option>> = {
    control: (base, state: ControlProps<Option, IsMulti>) => ({
      ...base,
      backgroundColor: isLightMode ? "#e4e5f1" : "#454547",
      borderColor: state.isFocused ? "transparent" : "#374151",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 0, 0, 0.2)" : "none",
      padding: "1px",
      minHeight: "42px",
      transition: "all 200ms",
      "&:hover": {
        borderColor: state.isFocused ? "transparent" : "#374151",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isLightMode ? "#e4e5f1" : "#2a2a2a",
      border: "1px solid #374151",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      zIndex: 100,
    }),
    option: (base, state: OptionProps<Option, IsMulti>) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#374151"
        : state.isSelected
          ? "#1f2937"
          : "transparent",
      color: state.isFocused ? "#fff" : isLightMode ? "#111827" : "#fff",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#1f2937",
      },
      "&:hover": {
        color: "#fff",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: isLightMode ? "#111827" : "#fff",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#374151",
      borderRadius: "0.375rem",
      margin: "2px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isLightMode ? "#111827" : "#fff",
      borderRadius: "0 0.375rem 0.375rem 0",
      padding: "0 4px",
      "&:hover": {
        backgroundColor: "#4b5563",
        color: isLightMode ? "#111827" : "#fff",
      },
    }),
    input: (base) => ({
      ...base,
      color: isLightMode ? "#111827" : "#fff",
    }),
    placeholder: (base) => ({
      ...base,
      color: isLightMode ? "#374151" : "#cbd5e1",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "8px",
      "&:hover": {
        color: "#9ca3af",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "8px",
      "&:hover": {
        color: "#9ca3af",
      },
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#374151",
      margin: "8px 0",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),
  };

  return (
    <div className="gap-1.5">
      {label && (
        <label className="text-sm font-medium text-twhite">{label}</label>
      )}
      <Select<Option, IsMulti> {...props} styles={selectStyles} />
    </div>
  );
};

export default CustomReactSelect;
