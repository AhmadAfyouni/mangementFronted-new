"use client";
import React from "react";
import { TaskFieldSettings } from "../page";
import {
  Clock,
  Flag,
  Calendar,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Timer,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target
} from "lucide-react";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepTaskFieldsProps {
  data: any;
  onChange: (changes: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onFinish: () => void;
}

const fields = [
  {
    key: "enableEstimatedTime",
    label: "Estimated Time",
    description: "Allow time estimates for better planning",
    icon: Clock,
    category: 'essential'
  },
  {
    key: "enablePriority",
    label: "Priority Levels",
    description: "Set task priority (Low, Medium, High, Critical)",
    icon: Flag,
    category: 'essential'
  },
  {
    key: "enableDueDate",
    label: "Due Dates",
    description: "Set deadlines and track overdue tasks",
    icon: Calendar,
    category: 'essential'
  },
  {
    key: "enableComments",
    label: "Comments & Discussion",
    description: "Enable team collaboration through comments",
    icon: MessageSquare,
    category: 'collaboration'
  },
  {
    key: "enableFiles",
    label: "File Attachments",
    description: "Attach documents, images, and other files",
    icon: Paperclip,
    category: 'collaboration'
  },
  {
    key: "enableSubTasks",
    label: "Subtasks",
    description: "Break down complex tasks into smaller steps",
    icon: CheckSquare,
    category: 'collaboration'
  },
  {
    key: "enableTimeTracking",
    label: "Time Tracking",
    description: "Track actual time spent on tasks",
    icon: Timer,
    category: 'advanced'
  },
  {
    key: "enableRecurring",
    label: "Recurring Tasks",
    description: "Create tasks that repeat automatically",
    icon: RotateCcw,
    category: 'advanced'
  },
];

const categoryInfo = {
  essential: {
    title: "Essential Features",
    description: "Core functionality for task management",
    icon: Target,
    color: "blue"
  },
  collaboration: {
    title: "Team Collaboration",
    description: "Features that enhance team communication",
    icon: MessageSquare,
    color: "green"
  },
  advanced: {
    title: "Advanced Features",
    description: "Powerful tools for detailed project management",
    icon: Zap,
    color: "purple"
  }
};

export default function StepTaskFields({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }: StepTaskFieldsProps) {
  const { t } = useTranslation();
  const handleFieldChange = (key: keyof TaskFieldSettings, value: boolean) => {
    onChange({ taskFieldSettings: { ...data.taskFieldSettings, [key]: value } });
  };

  const handleCategoryToggle = (category: 'essential' | 'collaboration' | 'advanced', enable: boolean) => {
    const categoryFields = fields.filter(f => f.category === category);
    const updates = categoryFields.reduce((acc, field) => ({
      ...acc,
      [field.key]: enable
    }), {});

    onChange({ taskFieldSettings: { ...data.taskFieldSettings, ...updates } });
  };

  const getCategoryStats = (category: 'essential' | 'collaboration' | 'advanced') => {
    const categoryFields = fields.filter(f => f.category === category);
    const enabledCount = categoryFields.filter(f => data.taskFieldSettings[f.key]).length;
    return { total: categoryFields.length, enabled: enabledCount };
  };

  const totalEnabled = fields.filter(f => data.taskFieldSettings[f.key]).length;

  return (
    <div className="space-y-6 p-4">
      {/* Categories */}
      {Object.entries(categoryInfo).map(([categoryKey, info]) => {
        const category = categoryKey as 'essential' | 'collaboration' | 'advanced';
        const categoryFields = fields.filter(f => f.category === category);
        const stats = getCategoryStats(category);
        const allEnabled = stats.enabled === stats.total;
        const noneEnabled = stats.enabled === 0;

        // Theme color mapping
        const colorClass =
          info.color === 'blue' ? 'primary' :
            info.color === 'green' ? 'success' :
              'warning';

        return (
          <div key={category} className={`border border-main rounded-xl overflow-hidden bg-secondary mb-6`}>
            {/* Category Header */}
            <div className={`px-6 py-4 border-b border-main bg-main border-l-4 border-${colorClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${colorClass}/10 text-${colorClass}`}>
                    <info.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-titles">{t(info.title)}</h3>
                    <p className="text-sm text-labels">{t(info.description)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-labels">
                    {stats.enabled}/{stats.total}
                  </span>
                  <div className="flex space-x-1">
                    {!allEnabled && (
                      <button
                        onClick={() => handleCategoryToggle(category, true)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors bg-${colorClass} text-twhite hover:opacity-90`}
                      >
                        {t("Enable All")}
                      </button>
                    )}
                    {!noneEnabled && (
                      <button
                        onClick={() => handleCategoryToggle(category, false)}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-dark text-twhite hover:opacity-90 transition-colors"
                      >
                        {t("Disable All")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Fields */}
            <div className="p-6 space-y-4">
              {categoryFields.map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="group">
                  <label className="flex items-start space-x-4 cursor-pointer p-3 rounded-lg transition-colors hover:bg-main/70">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={!!data.taskFieldSettings[key]}
                        onChange={(e) => handleFieldChange(key, e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${data.taskFieldSettings[key] ? `border-${colorClass} bg-${colorClass} shadow-sm` : 'border-main group-hover:border-primary'}`}>
                        {data.taskFieldSettings[key] && (
                          <svg className="w-3 h-3 text-twhite" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg transition-colors ${data.taskFieldSettings[key] ? `bg-${colorClass}/10 text-${colorClass}` : 'bg-main text-labels'}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-titles group-hover:text-primary">
                          {t(label)}
                        </div>
                        <div className="text-sm text-labels mt-1">
                          {t(description)}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Recommendation Box */}
      <div className="bg-warning/10 border border-warning rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-warning/20 rounded-lg">
            <Target className="w-4 h-4 text-warning" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">{t("Recommendation")}</h4>
            <p className="text-sm text-white">
              {t("We recommend enabling at least the Essential Features for optimal task management. You can always adjust these settings later in your company preferences.")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between p-4">
        <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-main text-twhite font-medium rounded-xl transition-colors hover:bg-secondary">{t("Back")}</button>
        <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
      </div>
    </div>
  );
}