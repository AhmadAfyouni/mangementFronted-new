"use client";
import React from "react";
import { Upload, FileText, Building2, X } from "lucide-react";
import Image from "next/image";
import FileUploadWithProgress from "@/components/common/atoms/ui/FileUploadWithProgress";
import useLanguage from "@/hooks/useLanguage";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { getFilenameFromUrl } from "@/utils/url/fileUrls";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

// CompanyProfile type copied from company-profile/page.tsx for type safety
interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
}

interface LicensesCertifications {
  name: string;
  number: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  documentUrl?: string;
}

interface CompanyProfile {
  _id?: string;
  companyName: string;
  companyLogo?: string;
  commercialRegistrationNumber: string;
  establishmentDate: string;
  businessType: string;
  companyDescription: string;
  officialEmail: string;
  phoneNumber: string;
  companyAddress: string;
  locationMapUrl?: string;
  socialMediaLinks?: SocialMediaLinks;
  taxNumber: string;
  licensesCertifications?: LicensesCertifications[];
  termsAndConditionsFiles?: string[];
  ceoName: string;
  organizationalStructureFile?: string;
  isSetupCompleted?: boolean;
}

// Helper for normalizing image/file URLs (copied from company-profile/page.tsx)
const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

interface StepCompanyDocumentsProps {
  data: any;
  onChange: (changes: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onFinish: () => void;
}

const StepCompanyDocuments: React.FC<StepCompanyDocumentsProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
  const { t } = useLanguage();
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

  return (
    <div className="space-y-6">
      {/* Company Logo */}
      <div className="bg-secondary rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
              <Upload className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-bold text-twhite">{t("Company Logo")}</h3>
          </div>
          {/* Logo Preview */}
          {data.companyLogo ? (
            <div
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-colors duration-300 shadow-md"
              onClick={() => data.companyLogo && openFile(data.companyLogo)}
              title={t("Click to view full size")}
            >
              <Image
                src={normalizeImageUrl(data.companyLogo)}
                alt="Company Logo"
                width={60}
                height={60}
                className="w-full h-full object-contain"
                onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        {/* Logo Uploader */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <FileUploadWithProgress
            onUploadComplete={fileUrl => onChange({ companyLogo: fileUrl })}
            onUploadError={handleFileUploadError}
            acceptedFileTypes=".png,.jpg,.jpeg,.gif,.svg,.webp"
            maxFileSize={5}
            uploadPath="company/logos"
            currentFileUrl={data.companyLogo}
            placeholder={t("Upload logo")}
            disabled={false}
          />
        </div>
      </div>

      {/* Other Documents */}
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-twhite mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          {t("Other Documents")}
        </h3>
        <div className="space-y-6">
          {/* Organizational Structure */}
          <div className="p-6 bg-main rounded-xl border border-gray-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-twhite font-medium">{t("Organizational Structure")}</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t("Upload organizational chart or structure document")}</p>
            {/* Show current file if exists */}
            {data.organizationalStructureFile ? (
              <div className="mb-4">
                <div
                  className="group p-4 bg-secondary rounded-lg border border-gray-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer"
                  onClick={() => openFile(data.organizationalStructureFile)}
                  title={t("Click to open file")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-twhite text-sm font-medium block">
                          {getFilenameFromUrl(data.organizationalStructureFile)}
                        </span>
                        <span className="text-gray-400 text-xs">{t("Click to view document")}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {t("Open")}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onChange({ organizationalStructureFile: "" }); }}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                        title={t("Remove file")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-600 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">{t("No organizational structure uploaded")}</p>
              </div>
            )}
            <FileUploadWithProgress
              onUploadComplete={fileUrl => onChange({ organizationalStructureFile: fileUrl })}
              onUploadError={handleFileUploadError}
              acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
              maxFileSize={10}
              uploadPath="company/documents"
              currentFileUrl={data.organizationalStructureFile}
              placeholder={t("Click to upload organizational structure")}
              disabled={false}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="p-6 bg-main rounded-xl border border-gray-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-twhite font-medium">{t("Terms & Conditions")}</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t("Upload terms and conditions documents")}</p>
            <div className="space-y-3">
              {data.termsAndConditionsFiles && data.termsAndConditionsFiles.length > 0 ? (
                <div className="space-y-3">
                  {data.termsAndConditionsFiles.map((fileUrl: string, index: number) => (
                    <div
                      key={index}
                      className="group p-4 bg-secondary rounded-lg border border-gray-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer"
                      onClick={() => openFile(fileUrl)}
                      title={t("Click to open file")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-twhite text-sm font-medium block">
                              {getFilenameFromUrl(fileUrl)}
                            </span>
                            <span className="text-gray-400 text-xs">{t("Click to view document")}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {t("Open")}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); onChange({ termsAndConditionsFiles: data.termsAndConditionsFiles!.filter((_: string, i: number) => i !== index) }); }}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                            title={t("Remove file")}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-600 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{t("No terms and conditions files uploaded")}</p>
                </div>
              )}
              <div className="mt-4">
                <FileUploadWithProgress
                  onUploadComplete={fileUrl => onChange({ termsAndConditionsFiles: [...(data.termsAndConditionsFiles || []), fileUrl] })}
                  onUploadError={handleFileUploadError}
                  acceptedFileTypes=".pdf,.doc,.docx"
                  maxFileSize={10}
                  uploadPath="company/terms"
                  placeholder={t("Click to upload terms & conditions")}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </div>
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

export default StepCompanyDocuments;
