"use client";
import React from "react";
import { FileText, X } from "lucide-react";
import FileUploadWithProgress from "@/components/common/atoms/ui/FileUploadWithProgress";
import useLanguage from "@/hooks/useLanguage";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { getFilenameFromUrl } from "@/utils/url/fileUrls";
import { useTranslation } from "react-i18next";

// Helper for normalizing image/file URLs (copied from company-profile/page.tsx)
const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

interface LicensesCertifications {
  name: string;
  number: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  documentUrl?: string;
}

interface CompanyProfile {
  taxNumber: string;
  licensesCertifications?: LicensesCertifications[];
}

interface StepCompanyLegalProps {
  data: any;
  onChange: (changes: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onFinish: () => void;
}

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.
const StepCompanyLegal: React.FC<StepCompanyLegalProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
  const { t } = useTranslation();
  const { setSnackbarConfig } = useMokkBar();

  // File upload error handler
  const handleFileUploadError = (error: string) => {
    setSnackbarConfig({ open: true, message: error, severity: "error" });
  };

  // Helper to open files in new tab
  const openFile = (fileUrl?: string) => {
    if (!fileUrl) return;
    const fullUrl = normalizeImageUrl(fileUrl);
    window.open(fullUrl, '_blank');
  };

  // Handler for updating a license
  const handleLicenseChange = (index: number, field: keyof LicensesCertifications, value: string) => {
    const newLicenses = [...(data.licensesCertifications || [])];
    newLicenses[index] = { ...newLicenses[index], [field]: value };
    onChange({ licensesCertifications: newLicenses });
  };

  // Handler for removing a license
  const handleRemoveLicense = (index: number) => {
    const newLicenses = (data.licensesCertifications || []).filter((_: any, i: number) => i !== index);
    onChange({ licensesCertifications: newLicenses });
  };

  // Handler for adding a license
  const handleAddLicense = () => {
    const newLicense: LicensesCertifications = {
      name: "",
      number: "",
      issuingAuthority: "",
      issueDate: "",
      expiryDate: "",
      documentUrl: ""
    };
    onChange({ licensesCertifications: [...(data.licensesCertifications || []), newLicense] });
  };

  return (
    <div className="space-y-6">
      {/* Legal & Financial Information */}
      <div className="bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-400" />
          {t("Legal & Financial Information")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Tax Number")}</label>
            <input
              type="text"
              value={data.taxNumber}
              onChange={e => onChange({ taxNumber: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter tax number")}
            />
          </div>
        </div>
      </div>

      {/* Licenses & Certifications */}
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-twhite flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {t("Licenses & Certifications")}
          </h3>
          <button
            onClick={handleAddLicense}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {t("Add License")}
          </button>
        </div>
        {data.licensesCertifications && data.licensesCertifications.length > 0 ? (
          <div className="space-y-4">
            {data.licensesCertifications.map((license: any, index: number) => (
              <div key={index} className="p-4 bg-main rounded-xl border border-gray-600">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-twhite font-medium">{t("License")} #{index + 1}</h4>
                    <button
                      onClick={() => handleRemoveLicense(index)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                      title={t("Remove license")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t("License Name")}</label>
                      <input
                        type="text"
                        value={license.name}
                        onChange={e => handleLicenseChange(index, "name", e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                        placeholder={t("Enter license name")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t("License Number")}</label>
                      <input
                        type="text"
                        value={license.number}
                        onChange={e => handleLicenseChange(index, "number", e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                        placeholder={t("Enter license number")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t("Issuing Authority")}</label>
                      <input
                        type="text"
                        value={license.issuingAuthority || ""}
                        onChange={e => handleLicenseChange(index, "issuingAuthority", e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                        placeholder={t("Enter issuing authority")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t("Issue Date")}</label>
                      <input
                        type="date"
                        value={license.issueDate || ""}
                        onChange={e => handleLicenseChange(index, "issueDate", e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t("Expiry Date")}</label>
                      <input
                        type="date"
                        value={license.expiryDate || ""}
                        onChange={e => handleLicenseChange(index, "expiryDate", e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t("License Document")}</label>
                    {license.documentUrl && (
                      <div className="mb-3">
                        <div
                          className="inline-flex items-center gap-2 p-2 bg-secondary rounded-lg border border-gray-600 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => openFile(license.documentUrl)}
                          title={t("Click to view document")}
                        >
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-twhite text-sm">{getFilenameFromUrl(license.documentUrl || "")}</span>
                        </div>
                      </div>
                    )}
                    <FileUploadWithProgress
                      onUploadComplete={fileUrl => {
                        const newLicenses = [...(data.licensesCertifications || [])];
                        newLicenses[index] = { ...license, documentUrl: fileUrl };
                        onChange({ licensesCertifications: newLicenses });
                      }}
                      onUploadError={handleFileUploadError}
                      acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      maxFileSize={10}
                      uploadPath="company/licenses"
                      currentFileUrl={license.documentUrl}
                      placeholder={t("Upload license document")}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">{t("No licenses or certifications added yet")}</p>
            <button
              onClick={handleAddLicense}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FileText className="w-4 h-4" />
              {t("Add First License")}
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-between p-4">
        {!isFirstStep && (
          <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-main text-twhite font-medium rounded-xl transition-colors hover:bg-secondary">{t("Back")}</button>
        )}
        {!isLastStep ? (
          <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
        ) : (
          <button onClick={onFinish} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Finish")}</button>
        )}
      </div>
    </div>
  );
};

export default StepCompanyLegal;
