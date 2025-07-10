"use client";
import React from "react";
import { Building2 } from "lucide-react";
import CompanyProfile from "@/app/company-profile/page";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepCompanyBasicInfoProps {
  data: CompanyProfile;
  onChange: (changes: Partial<CompanyProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onFinish: () => void;
}

const businessTypes = [
  'Technology', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Finance', 'Real Estate', 'Logistics',
  'Hospitality', 'Telecommunications', 'Energy', 'Consulting', 'Marketing', 'Transportation', 'Pharmaceuticals',
  'Agriculture', 'Entertainment', 'Non-profit', 'Government', 'E-commerce'
];

const StepCompanyBasicInfo: React.FC<StepCompanyBasicInfoProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          {t("Basic Information")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Company Name")}</label>
            <input
              type="text"
              value={data.companyName}
              onChange={e => onChange({ companyName: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter company name")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Commercial Registration Number")}</label>
            <input
              type="text"
              value={data.commercialRegistrationNumber}
              onChange={e => onChange({ commercialRegistrationNumber: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter registration number")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Establishment Date")}</label>
            <input
              type="date"
              value={data.establishmentDate}
              onChange={e => onChange({ establishmentDate: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Business Type")}</label>
            <select
              value={data.businessType}
              onChange={e => onChange({ businessType: e.target.value as any })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
            >
              {businessTypes.map(type => (
                <option key={type} value={type}>{t(type)}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Company Description")}</label>
            <textarea
              value={data.companyDescription}
              onChange={e => onChange({ companyDescription: e.target.value })}
              rows={3}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter company description")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("CEO Name")}</label>
            <input
              type="text"
              value={data.ceoName}
              onChange={e => onChange({ ceoName: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter CEO name")}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4">
        <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
      </div>
    </div>
  );
};

export default StepCompanyBasicInfo;
