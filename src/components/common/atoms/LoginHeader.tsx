"use client";
// src/components/Login/LoginHeader.tsx
import useLanguage from "@/hooks/useLanguage";
import { Briefcase } from "lucide-react";

const LoginHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center mb-8">
      <div
        className={`p-4 rounded-full mb-6 bg-tblack
      `}
      >
        <Briefcase className="w-8 h-8 text-white" />
      </div>
      <h1 className={`text-2xl font-bold mb-2 text-twhite`}>
        {t("CompanyManagmentSystem")}
      </h1>
      <p className={`text-sm text-tmid`}>{t("welcome_back")}</p>
    </div>
  );
};

export default LoginHeader;
