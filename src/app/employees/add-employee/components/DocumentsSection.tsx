/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { DynamicFieldArray, FileUpload } from "./FormComponents";
import { useTranslation } from "react-i18next";

const DocumentsSection = ({
  legalDocumentFields,
  appendLegalDocument,
  removeLegalDocument,
  certificationFields,
  appendCertification,
  removeCertification,
  register,
  errors,
  isLightMode,
  legalFileNames,
  setLegalFileNames,
  certificationFileNames,
  setCertificationFileNames,
  setValue,
  handleFileChange,
  reset,
  getValues
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Legal Documents Section */}
      <DynamicFieldArray
        title="Legal Documents"
        fields={legalDocumentFields}
        append={() => appendLegalDocument({ name: "", validity: "", file: null })}
        remove={removeLegalDocument}
        register={register}
        errors={errors}
        buttonText="Add Document"
        buttonColor="primary"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Document Name")}
              </label>
              <input
                type="text"
                {...register(`legal_documents.${index}.name`)}
                placeholder={t("Enter document name")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Validity Date")}
              </label>
              <input
                type="date"
                {...register(`legal_documents.${index}.validity`)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Document File")}
              </label>
              <FileUpload
                index={index}
                fieldName="legal_documents"
                fileNames={legalFileNames}
                setFileNames={setLegalFileNames}
                handleFileChange={handleFileChange}
                isLightMode={isLightMode}
                setValue={setValue}
              />
            </div>
          </div>
        )}
      </DynamicFieldArray>

      {/* Certifications Section */}
      <DynamicFieldArray
        title="Certifications"
        fields={certificationFields}
        append={() =>
          appendCertification({
            certificate_name: "",
            date: "",
            grade: "",
            file: null,
          })
        }
        remove={removeCertification}
        register={register}
        errors={errors}
        buttonText="Add Certification"
        buttonColor="success"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {t("Certificate Name")}
              </label>
              <input
                type="text"
                {...register(`certifications.${index}.certificate_name`)}
                placeholder={t("Enter certificate name")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Certification Date")}
              </label>
              <input
                type="date"
                {...register(`certifications.${index}.date`)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Grade/Score")}
              </label>
              <input
                type="text"
                {...register(`certifications.${index}.grade`)}
                placeholder={t("Enter grade or score")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {t("Certificate File")}
              </label>
              <FileUpload
                index={index}
                fieldName="certifications"
                fileNames={certificationFileNames}
                setFileNames={setCertificationFileNames}
                handleFileChange={handleFileChange}
                isLightMode={isLightMode}
                setValue={setValue}
              />
            </div>
          </div>
        )}
      </DynamicFieldArray>
    </>
  );
};

export default DocumentsSection;