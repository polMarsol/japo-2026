import { useTranslation } from "react-i18next";
import { useTheme } from "../lib/theme";
import { Icon } from "./Icon";
import { SUPPORTED_LANGUAGES } from "../i18n/resources";

const LANGUAGE_LABELS: Record<string, string> = {
  ca: "CA",
  en: "EN",
  es: "ES",
  ja: "JA",
};

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();

  return (
    <header className="safe-top sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-surface-2/95 px-4 py-2.5 backdrop-blur">
      <span className="text-sm font-semibold text-text">{t("appName")}</span>
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center">
          <Icon
            name="translate"
            className="pointer-events-none absolute left-2 h-4 w-4 text-muted"
          />
          <select
            aria-label={t("language.label")}
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="appearance-none rounded-full border border-line bg-transparent py-1.5 pl-7 pr-2.5 text-xs font-medium text-text"
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <option key={lng} value={lng} className="bg-surface text-text">
                {LANGUAGE_LABELS[lng]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-text active:bg-chip"
        >
          <Icon name={theme === "dark" ? "dark_mode" : "light_mode"} className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
