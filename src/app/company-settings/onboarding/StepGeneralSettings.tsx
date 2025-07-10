import React from "react";
import { Settings } from "lucide-react";
import type { CompanySettings } from "../page";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepGeneralSettingsProps {
    data: CompanySettings;
    onChange: (changes: Partial<CompanySettings>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    onFinish: () => void;
}

const StepGeneralSettings: React.FC<StepGeneralSettingsProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
    const { t } = useTranslation();
    const handleChange = (field: keyof CompanySettings, value: boolean) => {
        onChange({ [field]: value });
    };
    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    {t("General Settings")}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">{t("System Active")}</span>
                            <p className="text-gray-400 text-sm">{t("Enable or disable the entire system")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.isActive || false}
                                onChange={e => handleChange("isActive", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex justify-between p-4">
                <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-main text-twhite font-medium rounded-xl transition-colors hover:bg-secondary">{t("Back")}</button>
                {!isLastStep ? (
                    <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
                ) : (
                    <button onClick={onFinish} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Finish")}</button>
                )}
            </div>
        </div>
    );
};

export default StepGeneralSettings; 