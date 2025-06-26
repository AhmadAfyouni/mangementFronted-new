"use client";

import { useTranslation } from "react-i18next";

export default function TestPage() {
  const { t } = useTranslation();

  return <div>{t("page")}</div>;
}
