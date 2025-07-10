"use client";
import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

const StepCompanySocial = ({ data, onChange, onNext, onBack }: any) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          {t("Social Media Links")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Facebook")}</label>
            <input
              type="text"
              value={data.facebook}
              onChange={e => onChange({ facebook: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter Facebook URL")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Twitter")}</label>
            <input
              type="text"
              value={data.twitter}
              onChange={e => onChange({ twitter: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter Twitter URL")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Instagram")}</label>
            <input
              type="text"
              value={data.instagram}
              onChange={e => onChange({ instagram: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter Instagram URL")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Linkedin")}</label>
            <input
              type="text"
              value={data.linkedin}
              onChange={e => onChange({ linkedin: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter Linkedin URL")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Website")}</label>
            <input
              type="text"
              value={data.website}
              onChange={e => onChange({ website: e.target.value })}
              className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
              placeholder={t("Enter Website URL")}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between p-4">
        <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-secondary hover:bg-primary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Back")}</button>
        <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
      </div>
    </div>
  );
};

export default StepCompanySocial;
