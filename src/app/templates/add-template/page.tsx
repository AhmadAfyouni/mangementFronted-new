"use client";

// NewTemplate.tsx
import { CustomButton } from "@/components/common/atoms/ui/CustomButton";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import BasicFields from "@/components/common/atoms/templates/BasicFields";
import TransactionFields from "@/components/common/atoms/templates/TransactionFields";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useLanguage from "@/hooks/useLanguage";
import { FormData, TransactionField } from "@/types/new-template.type";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PendingLogic from "@/components/common/atoms/ui/PendingLogic";
import { useMokkBar } from "@/components/Providers/Mokkbar";

const NewTemplate: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { setSnackbarConfig } = useMokkBar();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    description: "",
    departments_approval_track: [],
    departments_execution_ids: [],
    departments_archive: [],
    needAdminApproval: false,
    duration: {
      unit: "hours",
      value: 0,
    },
    transactionFields: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { mutateAsync: createTemplate, isPending } = useCreateMutation({
    endpoint: "/templates",
    invalidateQueryKeys: ["templates"],
    requestType: "post",
    onSuccessFn: () => {
      router.back();
    },
  });

  // Comprehensive validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const errorMessages: string[] = [];

    // Validate basic fields
    if (!formData.name || formData.name.trim() === "") {
      errors.name = t("Template name is required");
      errorMessages.push(t("Template name is required"));
    }

    if (!formData.type || formData.type.trim() === "") {
      errors.type = t("Template type is required");
      errorMessages.push(t("Template type is required"));
    }

    if (!formData.description || formData.description.trim() === "") {
      errors.description = t("Description is required");
      errorMessages.push(t("Description is required"));
    }

    // Validate departments
    if (!formData.departments_approval_track || formData.departments_approval_track.length === 0) {
      errors.departments_approval_track = t("At least one approval department is required");
      errorMessages.push(t("At least one approval department is required"));
    }

    if (!formData.departments_execution_ids || formData.departments_execution_ids.length === 0) {
      errors.departments_execution_ids = t("At least one execution department is required");
      errorMessages.push(t("At least one execution department is required"));
    }

    if (!formData.departments_archive || formData.departments_archive.length === 0) {
      errors.departments_archive = t("At least one archive department is required");
      errorMessages.push(t("At least one archive department is required"));
    }

    // Validate duration
    if (!formData.duration.value || formData.duration.value <= 0) {
      errors.duration = t("Duration value must be greater than 0");
      errorMessages.push(t("Duration value must be greater than 0"));
    }

    if (!formData.duration.unit || formData.duration.unit.trim() === "") {
      errors.durationUnit = t("Duration unit is required");
      errorMessages.push(t("Duration unit is required"));
    }

    // Validate transaction fields
    if (!formData.transactionFields || formData.transactionFields.length === 0) {
      errors.transactionFields = t("At least one transaction field is required");
      errorMessages.push(t("At least one transaction field is required"));
    } else {
      // Validate each transaction field
      formData.transactionFields.forEach((field, index) => {
        if (!field.name || field.name.trim() === "") {
          errors[`transactionField_${index}_name`] = t("Field name is required");
          errorMessages.push(`${t("Transaction field")} ${index + 1}: ${t("Field name is required")}`);
        }

        if (!field.type || field.type.trim() === "") {
          errors[`transactionField_${index}_type`] = t("Field type is required");
          errorMessages.push(`${t("Transaction field")} ${index + 1}: ${t("Field type is required")}`);
        }

        // Check for duplicate field names
        const duplicateIndex = formData.transactionFields.findIndex(
          (otherField, otherIndex) =>
            otherIndex !== index &&
            otherField.name.toLowerCase().trim() === field.name.toLowerCase().trim()
        );

        if (duplicateIndex !== -1) {
          errors[`transactionField_${index}_duplicate`] = t("Duplicate field name");
          errorMessages.push(`${t("Transaction field")} ${index + 1}: ${t("Duplicate field name found")}`);
        }
      });
    }

    // Set validation errors for individual field highlighting
    setValidationErrors(errors);

    // Show validation errors using MokkBar if there are any
    if (errorMessages.length > 0) {
      setSnackbarConfig({
        open: true,
        message: errorMessages.join(", "),
        severity: "error",
      });
      return false;
    }

    // Clear validation errors if form is valid
    setValidationErrors({});
    return true;
  };

  // Clear specific validation error
  const clearValidationError = (fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Enhanced form data setter with validation error clearing
  const handleFormDataChange: React.Dispatch<React.SetStateAction<FormData>> = (value) => {
    setFormData(prev => typeof value === "function" ? (value as (prev: FormData) => FormData)(prev) : value);

    // Clear related validation errors when fields are modified
    const fieldsToCheck = [
      'name', 'type', 'description', 'departments_approval_track',
      'departments_execution_ids', 'departments_archive', 'duration'
    ];

    fieldsToCheck.forEach(field => {
      if (validationErrors[field]) {
        clearValidationError(field);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    console.log(formData);
    createTemplate(formData);
  };

  const handleTransactionFieldsChange = (fields: TransactionField[]) => {
    setFormData((prev) => ({
      ...prev,
      transactionFields: fields,
    }));

    // Clear transaction field validation errors when fields change
    const transactionFieldErrors = Object.keys(validationErrors).filter(key =>
      key.startsWith('transactionField_') || key === 'transactionFields'
    );

    if (transactionFieldErrors.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        transactionFieldErrors.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  // Helper function to check if a field has validation errors
  const hasValidationError = (fieldName: string): boolean => {
    return !!validationErrors[fieldName];
  };

  // Helper function to get validation error message
  const getValidationError = (fieldName: string): string => {
    return validationErrors[fieldName] || "";
  };

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row justify-between items-center gap-5 mb-5">
        <h1 className="text-3xl font-bold text-twhite text-center pb-4">
          {t("New Template")}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <BasicFields
          formData={formData}
          setFormData={handleFormDataChange}
        />
        <TransactionFields
          transactionFields={formData.transactionFields}
          setTransactionFields={handleTransactionFieldsChange}
        />

        {/* Show validation error for transaction fields if needed */}
        {hasValidationError('transactionFields') && (
          <div className="mt-2 mb-4">
            <p className="text-red-400 text-sm">{getValidationError('transactionFields')}</p>
          </div>
        )}

        <CustomButton
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {
            <PendingLogic
              isPending={isPending}
              normalText={t("Create Template")}
              pendingText={t("Creating Template...")}
            />
          }
        </CustomButton>
      </form>
    </GridContainer>
  );
};

export default NewTemplate;