import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, SUPPORTED_LANGUAGES, type SupportedLanguage } from "./resources";

const STORAGE_KEY = "japo2026:lang";

function detectLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  const browser = navigator.language.slice(0, 2);
  if (SUPPORTED_LANGUAGES.includes(browser as SupportedLanguage)) {
    return browser as SupportedLanguage;
  }
  return "ca";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: "ca",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language;

export default i18n;
