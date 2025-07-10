"use client";
import React from "react";
import {
  Mail,
  Smartphone,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bell,
  AlertTriangle,
  CheckCircle,
  Volume2
} from "lucide-react";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

const notificationSettings = [
  {
    key: "enableEmailNotifications",
    title: "Email Notifications",
    description: "Receive updates and alerts via email",
    icon: Mail,
    color: "blue",
    category: "delivery"
  },
  {
    key: "enablePushNotifications",
    title: "Push Notifications",
    description: "Get instant notifications on your device",
    icon: Smartphone,
    color: "green",
    category: "delivery"
  },
  {
    key: "enableTaskDeadlineReminders",
    title: "Task Deadline Reminders",
    description: "Get notified before task deadlines",
    icon: Clock,
    color: "orange",
    category: "reminders"
  },
  {
    key: "enableProjectDeadlineReminders",
    title: "Project Deadline Reminders",
    description: "Receive alerts for upcoming project deadlines",
    icon: Calendar,
    color: "red",
    category: "reminders"
  }
];

interface StepNotificationsProps {
  data: any;
  onChange: (changes: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepNotifications({ data, onChange, onNext, onBack }: StepNotificationsProps) {
  const { t } = useTranslation();
  const handleChange = (key: string, value: boolean) => {
    onChange({ [key]: value });
  };

  const handlePreset = (preset: 'all' | 'essential' | 'none') => {
    const updates: Record<string, boolean> = {};

    notificationSettings.forEach(setting => {
      switch (preset) {
        case 'all':
          updates[setting.key] = true;
          break;
        case 'essential':
          updates[setting.key] = setting.category === 'reminders' || setting.key === 'enableEmailNotifications';
          break;
        case 'none':
          updates[setting.key] = false;
          break;
      }
    });

    onChange(updates);
  };

  const deliverySettings = notificationSettings.filter(s => s.category === 'delivery');
  const reminderSettings = notificationSettings.filter(s => s.category === 'reminders');

  const enabledCount = notificationSettings.filter(s => data[s.key]).length;
  const hasDeliveryMethod = deliverySettings.some(s => data[s.key]);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
          <Bell className="w-4 h-4" />
          <span>{t("{{enabled}} of {{total}} notifications enabled", { enabled: enabledCount, total: notificationSettings.length })}</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <Volume2 className="w-4 h-4 mr-2" />
          {t("Quick Setup")}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => handlePreset('all')}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors text-sm font-medium"
          >
            {t("Enable All")}
          </button>
          <button
            onClick={() => handlePreset('essential')}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-sm font-medium"
          >
            {t("Essential Only")}
          </button>
          <button
            onClick={() => handlePreset('none')}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            {t("Disable All")}
          </button>
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-950 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("Delivery Methods")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("Choose how you want to receive notifications")}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {deliverySettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <label key={setting.key} className="flex items-start space-x-4 cursor-pointer p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={!!data[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                    ${data[setting.key]
                      ? `border-${setting.color}-600 bg-${setting.color}-600 shadow-sm`
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }
                  `}>
                    {data[setting.key] && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 flex-1">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${data[setting.key]
                      ? `bg-${setting.color}-100 dark:bg-${setting.color}-900 text-${setting.color}-600 dark:text-${setting.color}-400`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {t(setting.title)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t(setting.description)}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-950 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("Deadline Reminders")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("Get notified about upcoming deadlines")}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {reminderSettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <label key={setting.key} className="flex items-start space-x-4 cursor-pointer p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={!!data[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.checked)}
                    className="sr-only"
                    disabled={!hasDeliveryMethod}
                  />
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                    ${!hasDeliveryMethod
                      ? 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed'
                      : data[setting.key]
                        ? `border-${setting.color}-600 bg-${setting.color}-600 shadow-sm`
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }
                  `}>
                    {data[setting.key] && hasDeliveryMethod && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 flex-1">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${!hasDeliveryMethod
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                      : data[setting.key]
                        ? `bg-${setting.color}-100 dark:bg-${setting.color}-900 text-${setting.color}-600 dark:text-${setting.color}-400`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {t(setting.title)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t(setting.description)}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Warning if no delivery method */}
      {!hasDeliveryMethod && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">{t("Enable Delivery Method")}</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t("Please enable at least one delivery method (Email or Push) to receive deadline reminders.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {hasDeliveryMethod && enabledCount > 0 && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">{t("Great Choice!")}</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                {t("You'll stay informed about important updates and deadlines. You can adjust these settings anytime in your preferences.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t("Back")}</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
        >
          <span>{t("Continue")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}