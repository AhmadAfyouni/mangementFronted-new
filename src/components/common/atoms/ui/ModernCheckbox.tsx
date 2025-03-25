import { ModernCheckboxProps } from "@/types/components/ModernCheckbox.type";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Select, { MultiValue } from "react-select";

const ModernCheckbox: React.FC<ModernCheckboxProps> = ({
  options,
  defaultSelected = [],
  placeholder = "Select options...",
  onChange,
}) => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >(defaultSelected);

  const handleChange = (
    selected: MultiValue<{
      label: string;
      value: string;
    }>
  ) => {
    setSelectedOptions(selected);
    onChange(selected);
  };

  return (
    <Select
      value={selectedOptions}
      onChange={handleChange}
      options={options}
      isMulti
      placeholder={t(placeholder)}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default ModernCheckbox;
