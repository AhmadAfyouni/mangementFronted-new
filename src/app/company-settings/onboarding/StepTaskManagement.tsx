import React from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CompanySettingsType, ProgressCalculationMethod } from "@/types/CompanySettings.type";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepTaskManagementProps {
    data: CompanySettingsType;
    onChange: (changes: Partial<CompanySettingsType>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    onFinish: () => void;
}

const StepTaskManagement: React.FC<StepTaskManagementProps> = ({ data, onChange, onNext, onBack, isLastStep, onFinish }) => {
    const { t } = useTranslation();
    const handleChange = (field: keyof CompanySettingsType, value: any) => {
        onChange({ [field]: value });
    };
    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-400" />
                    {t("Task Management")}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">{t("Allow Task Duplication")}</span>
                            <p className="text-gray-400 text-sm">{t("Allow users to duplicate existing tasks")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.allowTaskDuplication || false}
                                onChange={e => handleChange("allowTaskDuplication", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">{t("Require Task Approval")}</span>
                            <p className="text-gray-400 text-sm">{t("Tasks need approval before being marked as complete")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.requireTaskApproval || false}
                                onChange={e => handleChange("requireTaskApproval", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">{t("Auto Generate Task IDs")}</span>
                            <p className="text-gray-400 text-sm">{t("Automatically generate unique IDs for new tasks")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.autoGenerateTaskIds || false}
                                onChange={e => handleChange("autoGenerateTaskIds", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Default Task Reminder (Days)")}</label>
                            <input
                                type="number"
                                min="1"
                                value={data.defaultTaskReminderDays || 5}
                                onChange={e => handleChange("defaultTaskReminderDays", parseInt(e.target.value))}
                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t("Progress Calculation Method")}</label>
                            <select
                                value={data.progressCalculationMethod || ProgressCalculationMethod.TIME_BASED}
                                onChange={e => handleChange("progressCalculationMethod", e.target.value)}
                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                            >
                                <option value={ProgressCalculationMethod.TIME_BASED}>{t("Time Based")}</option>
                                <option value={ProgressCalculationMethod.DATE_BASED}>{t("Date Based")}</option>
                            </select>
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

export default StepTaskManagement; 