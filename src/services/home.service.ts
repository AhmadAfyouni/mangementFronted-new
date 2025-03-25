import { TFunction } from "i18next";

export const getHomeDate = (locale: "ar" | "en") => {
  const locales = {
    en: "en-US",
    ar: "ar-EG",
  };
  const date = new Date();
  return date.toLocaleDateString(locales[locale], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export const getGreeting = (t: TFunction<"translation", undefined>) => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return t("Good Morning");
  if (currentHour < 18) return t("Good Afternoon");
  return t("Good Evening");
};
