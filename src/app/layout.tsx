// src/app/layout.tsx
"use client";

import LayoutProviders from "@/components/Providers/LayoutProviders";
import "./globals.css";
import { useTranslation } from "react-i18next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <html lang="en">
      <head>
        <title>{t("Company Management System")}</title>
      </head>
      <body className="bg-main">
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
