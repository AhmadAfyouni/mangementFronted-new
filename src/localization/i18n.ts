import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "@/localization/locales/en.json";
import arTranslation from "@/localization/locales/ar.json";

const resources = {
  en: enTranslation,
  ar: arTranslation,
};

const defaultLanguage = "en";

// Ensure savedLanguage is always a string
const savedLanguage =
  typeof window !== "undefined" && localStorage.getItem("language")
    ? localStorage.getItem("language") ?? defaultLanguage
    : defaultLanguage;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // Now guaranteed to be a string
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
