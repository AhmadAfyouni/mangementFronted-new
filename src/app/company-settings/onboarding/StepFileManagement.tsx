import React from "react";
import { FileText } from "lucide-react";
import type { CompanySettings } from "../page";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepFileManagementProps {
    data: CompanySettings;
    onChange: (changes: Partial<CompanySettings>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    onFinish: () => void;
}

const fileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.txt', '.zip', '.rar'];

const StepFileManagement: React.FC<StepFileManagementProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
    const { t } = useTranslation();
    const handleChange = (field: keyof CompanySettings, value: any) => {
        onChange({ [field]: value });
    };
    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    {t("File Management Settings")}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t("Maximum File Upload Size (MB)")}</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={data.maxFileUploadSize || 10}
                            onChange={e => handleChange("maxFileUploadSize", parseInt(e.target.value))}
                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t("Allowed File Types")}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {fileTypes.map((type) => (
                                <label key={type} className="flex items-center space-x-2 p-2 bg-main rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={data.allowedFileTypes?.includes(type) || false}
                                        onChange={e => {
                                            const currentTypes = data.allowedFileTypes || [];
                                            const newTypes = e.target.checked
                                                ? [...currentTypes, type]
                                                : currentTypes.filter(t => t !== type);
                                            handleChange("allowedFileTypes", newTypes);
                                        }}
                                        className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-twhite text-sm">{t(type)}</span>
                                </label>
                            ))}
                        </div>
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

export default StepFileManagement; 