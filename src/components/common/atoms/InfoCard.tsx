"use client";

import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import React from "react";

type Detail = {
  label: string;
  value: string | number | undefined;
};

type InfoCardProps = {
  firstTitle: string;
  secondTitle?: string;
  firstDetails: Detail[];
  secondDetails?: Detail[];
  customStyle?: string;
  fieldCustomStyle?: string;
};

const InfoCard: React.FC<InfoCardProps> = ({
  firstDetails,
  firstTitle,
  secondDetails,
  secondTitle,
  customStyle,
  fieldCustomStyle,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const renderField = (label: string, value: string | number | undefined) => (
    <div
      className={` -z-1 flex items-center justify-between gap-5 ${
        fieldCustomStyle
          ? fieldCustomStyle
          : isLightMode
          ? "bg-darker text-tblackAF"
          : "bg-slate-600"
      } rounded px-3 py-2`}
    >
      <span>{t(label)}</span>
      <div className="border-2 border-yellow-500/20 bg-secondary text-twhite py-2 px-3 rounded-md text-sm font-bold">
        {t(value + "") || t("Not Available")}
      </div>
    </div>
  );

  return (
    <div
      className={`mt-5  h-fit rounded-xl shadow-md  p-6 flex flex-col gap-2   ${
        customStyle ? customStyle : "bg-droppable-fade text-twhite"
      }`}
    >
      <div>{t(firstTitle)}</div>
      {firstDetails.map(({ label, value }, index) => (
        <React.Fragment key={index}>{renderField(label, value)}</React.Fragment>
      ))}

      {secondDetails && secondTitle && (
        <>
          <div>{t(secondTitle)}</div>
          {secondDetails.map(({ label, value }, index) => (
            <React.Fragment key={index}>
              {renderField(label, value)}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

export default InfoCard;
