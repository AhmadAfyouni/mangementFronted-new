"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { Bell, Building2, CheckCircle, Clock, Settings, Mail, FileText, Globe, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StepCompanyBasicInfo from "./company-profile-steps/StepCompanyBasicInfo";
import StepCompanyContact from "./company-profile-steps/StepCompanyContact";
import StepCompanyLegal from "./company-profile-steps/StepCompanyLegal";
import StepCompanySocial from "./company-profile-steps/StepCompanySocial";
import StepCompanyDocuments from "./company-profile-steps/StepCompanyDocuments";
import StepTaskFields from "./StepTaskFields";
import StepWorkHours from "./StepWorkHours";
import StepAdditionalSettings from "./StepAdditionalSettings";
import StepTaskManagement from "./StepTaskManagement";
import StepNotificationSettings from "./StepNotificationSettings";
import StepFileManagement from "./StepFileManagement";
import StepGeneralSettings from "./StepGeneralSettings";
import type { CompanyProfile } from "@/types/CompanyProfile.type";
import useLanguage from "@/hooks/useLanguage";
import { LangIcon } from "@/assets";
import Image from "next/image";
import { CompanySettingsType } from "@/types/CompanySettings.type";

type StepConfig = {
  id: number;
  label: string;
  Component: any;
  icon: any;
  description: string;
  type: "profile" | "settings";
};

export default function CompanySettingsOnboarding() {
  const { t, toggleLanguage } = useLanguage();
  // Step config must be inside the component so t is defined
  const steps: StepConfig[] = [
    {
      type: "profile",
      id: 0,
      label: t("Company Info"),
      Component: StepCompanyBasicInfo,
      icon: Building2,
      description: t("Enter your company's basic information")
    },
    {
      type: "profile",
      id: 1,
      label: t("Contact & Location"),
      Component: StepCompanyContact,
      icon: Mail,
      description: t("Set up company contact and location details")
    },
    {
      type: "profile",
      id: 2,
      label: t("Legal & Financial"),
      Component: StepCompanyLegal,
      icon: FileText,
      description: t("Legal and financial information")
    },
    {
      type: "profile",
      id: 3,
      label: t("Documents"),
      Component: StepCompanyDocuments,
      icon: Upload,
      description: t("Upload company documents")
    },
    {
      type: "profile",
      id: 4,
      label: t("Social Media"),
      Component: StepCompanySocial,
      icon: Globe,
      description: t("Add your company's social media links")
    },
    {
      type: "settings",
      id: 5,
      label: t("Work Hours"),
      Component: StepWorkHours,
      icon: Clock,
      description: t("Configure your company's working schedule")
    },
    {
      type: "settings",
      id: 6,
      label: t("Additional Settings"),
      Component: StepAdditionalSettings,
      icon: Settings,
      description: t("Set default break time, overtime rate, and timezone")
    },
    {
      type: "settings",
      id: 7,
      label: t("Task Fields"),
      Component: StepTaskFields,
      icon: Settings,
      description: t("Customize available task features")
    },
    {
      type: "settings",
      id: 8,
      label: t("Task Management"),
      Component: StepTaskManagement,
      icon: Settings,
      description: t("Configure task management options")
    },
    {
      type: "settings",
      id: 9,
      label: t("Notification Settings"),
      Component: StepNotificationSettings,
      icon: Bell,
      description: t("Configure notification preferences")
    },
    {
      type: "settings",
      id: 10,
      label: t("File Management"),
      Component: StepFileManagement,
      icon: FileText,
      description: t("Set file upload limits and allowed types")
    },
    {
      type: "settings",
      id: 11,
      label: t("General Settings"),
      Component: StepGeneralSettings,
      icon: Settings,
      description: t("General system settings")
    },
  ];

  const router = useRouter();
  const { data: companySettings } = useCustomQuery<CompanySettingsType>({
    queryKey: ["company-settings"],
    url: "/company-settings",
    nestedData: true,
  });
  const { data: companyProfile } = useCustomQuery<CompanyProfile>({
    queryKey: ["company-profile"],
    url: "/company-profile",
    nestedData: true,
  });

  const { mutateAsync: upsertCompanySettings, } = useCreateMutation({
    endpoint: "/company-settings",
    onSuccessMessage: "Company settings saved!",
    invalidateQueryKeys: ["company-settings"],
    requestType: "put",
  });
  const { mutateAsync: upsertCompanyProfile } = useCreateMutation({
    endpoint: "/company-profile",
    onSuccessMessage: "Company profile saved!",
    invalidateQueryKeys: ["company-profile"],
    requestType: "put",
  });

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<{ companyProfile: CompanyProfile; companySettings: CompanySettingsType } | null>(null);


  useEffect(() => {
    if (companySettings && companyProfile) {
      setFormData({
        companyProfile: { ...companyProfile },
        companySettings: { ...companySettings },
      });
    }
  }, [companySettings, companyProfile]);

  useEffect(() => {
    if (companySettings && companySettings.isFirstTime === false) {
      router.replace("/home");
    }
  }, [companySettings, router]);

  if (!formData) {
    return (
      <GridContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-labels">{t("Loading your workspace...")}</p>
          </div>
        </div>
      </GridContainer>
    );
  }

  const handleProfileChange = (changes: Partial<CompanyProfile>) => {
    setFormData((prev) => prev ? { ...prev, companyProfile: { ...prev.companyProfile, ...changes } } : prev);
  };
  const handleSettingsChange = (changes: Partial<CompanySettingsType>) => {
    setFormData((prev) => prev ? { ...prev, companySettings: { ...prev.companySettings, ...changes } } : prev);
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!formData) return;
    try {
      await upsertCompanyProfile(formData.companyProfile);
      await upsertCompanySettings({ ...formData.companySettings, isFirstTime: false });
      router.replace("/home");
    } catch (e) {
      console.log(e);
    } finally {

    }
  };

  const currentStep = steps[step];
  const StepComponent = currentStep.Component;

  return (
    <GridContainer>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-twhite">{t("Company Setup Wizard")}</h1>
            </div>
            {/* Language Toggle Button */}
            <div className="relative group" onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
              <div className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 hover:shadow-lg active:scale-95">
                <Image src={LangIcon} width={20} height={20} alt="language icon" className="transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>
          </div>
          <p className="text-labels max-w-2xl">
            {t("Onboarding Subtitle")}
          </p>
        </div>
        {/* Progress Stepper */}
        <div className="bg-secondary rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-dark -z-10">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-in-out"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              />
            </div>
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isCompleted = index < step;
              const isCurrent = index === step;
              return (
                <div key={s.id} className="flex flex-col items-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-3
                      ${isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-110'
                          : 'bg-main dark:bg-dark text-gray-400 border-2 border-dark'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-secondary rounded-xl shadow-lg border border-gray-700">
          {/* Language Toggle Button - top right */}
          {/* NOTE: If you still see English text after toggling, check for missing translation keys in ar.json. All step labels and descriptions are present, but some dynamic or hardcoded texts may need to be added. */}
          <div>
            <StepComponent
              data={currentStep.type === "profile" ? formData.companyProfile : formData.companySettings}
              onChange={currentStep.type === "profile" ? handleProfileChange : handleSettingsChange}
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep={step === 0}
              isLastStep={step === steps.length - 1}
              onFinish={handleFinish}
            />
          </div>
        </div>
      </div>
    </GridContainer>
  );
}