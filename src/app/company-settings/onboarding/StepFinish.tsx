"use client";
import React from "react";
import {
  CheckCircle,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Settings,
  Bell,
  Building2,
  Trophy
} from "lucide-react";
import { useTranslation } from "react-i18next";

// NOTE: All user-facing text is now wrapped in t(). Add missing keys to en.json and ar.json for full localization.

interface StepFinishProps {
  onFinish: () => void;
  onBack: () => void;
  isPending?: boolean;
}

export default function StepFinish({ onFinish, onBack, isPending }: StepFinishProps) {
  const { t } = useTranslation();
  const completedSteps = [
    {
      icon: Clock,
      title: t("Work Hours Configured"),
      description: t("Your company's working schedule is set up")
    },
    {
      icon: Settings,
      title: t("Task Fields Customized"),
      description: t("Selected the features your team needs")
    },
    {
      icon: Bell,
      title: t("Notifications Configured"),
      description: t("Set up how you want to be notified")
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 animate-bounce">
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          389 {t("Setup Complete!")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {t("Congratulations! Your company workspace is now configured and ready to boost your team's productivity.")}
        </p>
      </div>

      {/* Completed Steps Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          {t("What We've Set Up")}
        </h3>

        <div className="space-y-3">
          {completedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center space-x-3 text-left">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          {t("What's Next?")}
        </h3>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span>31f</span>
            <span>{t("Create your first project and invite team members")}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>680</span>
            <span>{t("Start organizing tasks and tracking progress")}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>{t("Customize settings anytime in Company Settings")}</span>
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>{t("Remember:")}</strong> {t("You can always modify these settings later in your Company Settings page. Your configuration will automatically apply to all team members.")}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t("Back")}</span>
        </button>

        <button
          onClick={onFinish}
          disabled={isPending}
          className="
            flex items-center space-x-2 px-8 py-3 
            bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 
            text-white font-semibold rounded-xl transition-all duration-200 
            shadow-lg hover:shadow-xl transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t("Saving...")}</span>
            </>
          ) : (
            <>
              <span>{t("Go to Dashboard")}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}