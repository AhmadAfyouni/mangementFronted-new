import React from "react";
import { Settings } from "lucide-react";
import { CompanySettingsType } from "@/types/CompanySettings.type";

interface StepAdditionalSettingsProps {
    data: CompanySettingsType;
    onChange: (changes: Partial<CompanySettingsType>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    onFinish: () => void;
}

const StepAdditionalSettings: React.FC<StepAdditionalSettingsProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
    const handleWorkSettingsChange = (field: keyof CompanySettingsType["workSettings"], value: any) => {
        onChange({ workSettings: { ...data.workSettings, [field]: value } });
    };
    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Additional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Default Break Time (minutes)</label>
                        <input
                            type="number"
                            min="0"
                            value={data.workSettings.defaultBreakTimeMinutes ?? ""}
                            onChange={e => handleWorkSettingsChange("defaultBreakTimeMinutes", e.target.value === "" ? undefined : parseInt(e.target.value))}
                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                            placeholder="Enter break time in minutes"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used as default for new working days</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Overtime Rate</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={data.workSettings.overtimeRate ?? ""}
                            onChange={e => handleWorkSettingsChange("overtimeRate", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                        <select
                            value={data.workSettings.timezone || ""}
                            onChange={e => handleWorkSettingsChange("timezone", e.target.value)}
                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select Timezone</option>
                            <option value="Asia/Riyadh">Asia/Riyadh</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="Asia/Dubai">Asia/Dubai</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-between p-4">
                {!isFirstStep && (
                    <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-main text-twhite font-medium rounded-xl transition-colors hover:bg-secondary">Back</button>
                )}
                {!isLastStep ? (
                    <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">Continue</button>
                ) : (
                    <button onClick={onFinish} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">Finish</button>
                )}
            </div>
        </div>
    );
};

export default StepAdditionalSettings; 