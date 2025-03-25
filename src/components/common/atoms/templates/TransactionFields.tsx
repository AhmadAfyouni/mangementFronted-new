// TransactionFields.tsx
import { TrashIcon } from "@/assets";
import useLanguage from "@/hooks/useLanguage";
import { Option, TransactionField } from "@/types/new-template.type";
import Image from "next/image";
import { CustomButton } from "../ui/CustomButton";
import { CustomInput } from "../ui/CustomInput";
import { CustomSelect } from "../ui/CustomSelect";

interface TransactionFieldsProps {
  transactionFields: TransactionField[];
  setTransactionFields: (fields: TransactionField[]) => void;
}

const TransactionFields: React.FC<TransactionFieldsProps> = ({
  transactionFields,
  setTransactionFields,
}) => {
  const { t } = useLanguage();

  const fieldTypes: Option[] = [
    { value: "text", label: t("Text") },
    { value: "textarea", label: t("Textarea") },
    { value: "number", label: t("Number") },
    { value: "file", label: t("File") },
  ];

  const handleAddField = () => {
    const newFields = [
      ...transactionFields,
      { name: "", type: "text" } as TransactionField,
    ];
    setTransactionFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = transactionFields.filter((_, i) => i !== index);
    setTransactionFields(newFields);
  };

  const handleAdditionalFieldChange = (
    index: number,
    field: keyof TransactionField,
    value: string
  ) => {
    const newFields = transactionFields.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]:
              field === "type" ? (value as TransactionField["type"]) : value,
          }
        : item
    );
    setTransactionFields(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-twhite">
          {t("Transactions Fields")}
        </h3>
        <CustomButton type="button" onClick={handleAddField}>
          {t("Add Field")}
        </CustomButton>
      </div>
      <div className="space-y-4">
        {transactionFields.map((field, index) => (
          <div
            key={index}
            className="flex w-full gap-4 items-end border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
          >
            <div className="flex-1">
              <CustomInput
                className="w-full"
                label={t("Field Name")}
                value={field.name}
                onChange={(e) =>
                  handleAdditionalFieldChange(index, "name", e.target.value)
                }
                placeholder={t("Enter field name")}
              />
            </div>
            <div className="flex-1">
              <CustomSelect
                className="w-full"
                label={t("Field Type")}
                value={field.type}
                onChange={(e) =>
                  handleAdditionalFieldChange(index, "type", e.target.value)
                }
                options={fieldTypes}
                placeholder={t("Field Type")}
              />
            </div>
            <CustomButton
              type="button"
              onClick={() => handleRemoveField(index)}
              className="!bg-red-500 hover:!bg-red-400 !text-white w-24 flex items-center justify-center"
            >
              <Image
                src={TrashIcon}
                alt="icon"
                width={25}
                height={25}
                quality={100}
              />
            </CustomButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionFields;
