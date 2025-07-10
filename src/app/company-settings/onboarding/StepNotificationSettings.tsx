import React from "react";
import { Bell } from "lucide-react";
import type { CompanySettings } from "../page";

interface StepNotificationSettingsProps {
    data: CompanySettings;
    onChange: (changes: Partial<CompanySettings>) => void;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    onFinish: () => void;
}

const StepNotificationSettings: React.FC<StepNotificationSettingsProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
    const handleChange = (field: keyof CompanySettings, value: boolean) => {
        onChange({ [field]: value });
    };
    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notification Settings
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">Email Notifications</span>
                            <p className="text-gray-400 text-sm">Send notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.enableEmailNotifications || false}
                                onChange={e => handleChange("enableEmailNotifications", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">Push Notifications</span>
                            <p className="text-gray-400 text-sm">Send push notifications to devices</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.enablePushNotifications || false}
                                onChange={e => handleChange("enablePushNotifications", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">Task Deadline Reminders</span>
                            <p className="text-gray-400 text-sm">Remind users about upcoming task deadlines</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.enableTaskDeadlineReminders || false}
                                onChange={e => handleChange("enableTaskDeadlineReminders", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                        <div>
                            <span className="text-twhite font-medium">Project Deadline Reminders</span>
                            <p className="text-gray-400 text-sm">Remind users about upcoming project deadlines</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.enableProjectDeadlineReminders || false}
                                onChange={e => handleChange("enableProjectDeadlineReminders", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
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

export default StepNotificationSettings; 