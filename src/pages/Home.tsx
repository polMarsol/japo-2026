import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { useDayProgress } from "../lib/dayState";
import { useTheme } from "../lib/theme";
import { getDayHeroPhoto, photoUrl } from "../lib/photos";
import { Icon, type IconName } from "../components/Icon";
import { SUPPORTED_LANGUAGES } from "../i18n/resources";

const LANGUAGE_LABELS: Record<string, string> = { ca: "CA", en: "EN", es: "ES", ja: "JA" };

function NavTile({
  to,
  icon,
  label,
  sublabel,
  photo,
}: {
  to: string;
  icon: IconName;
  label: string;
  sublabel: string;
  photo?: string;
}) {
  return (
    <Link
      to={to}
      className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface p-3"
    >
      {photo ? (
        <>
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        </>
      ) : (
        <Icon name={icon} className="absolute right-3 top-3 h-6 w-6 text-accent" />
      )}
      <span
        className={`relative z-10 flex items-center gap-1.5 text-sm font-semibold ${
          photo ? "text-white" : "text-text"
        }`}
      >
        {photo && <Icon name={icon} className="h-4 w-4" />}
        {label}
      </span>
      <span className={`relative z-10 text-xs ${photo ? "text-white/70" : "text-muted"}`}>
        {sublabel}
      </span>
    </Link>
  );
}

export function Home() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const { theme, toggle } = useTheme();
  const trip = db.index.filter((e) => e.date);
  const totalDays = Object.keys(db.days).length;
  const { count } = useDayProgress();
  const progressPct = totalDays ? Math.round((count / totalDays) * 100) : 0;
  const heroPhoto = getDayHeroPhoto(i18n.language, "1");

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <header className="flex flex-col items-center gap-2 pt-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent-soft">
          {heroPhoto ? (
            <img src={photoUrl(heroPhoto)} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="explore" className="h-7 w-7 text-accent" />
          )}
        </div>
        <h1 className="text-lg font-semibold text-text">{t("home.title")}</h1>
        <p className="text-xs text-muted">
          {trip[0]?.date} → {trip[trip.length - 1]?.date}
        </p>

        <div className="mt-1 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-text">{totalDays}</span>
            <span className="text-[11px] text-muted">{t("home.itinerary")}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-text">
              {db.reservations.items.length}
            </span>
            <span className="text-[11px] text-muted">{t("nav.reservations")}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-text">{progressPct}%</span>
            <span className="text-[11px] text-muted">
              {t("days.progress", { done: count, total: totalDays })}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <NavTile
          to="/dies"
          icon="calendar_month"
          label={t("nav.days")}
          sublabel={t("days.progress", { done: count, total: totalDays })}
          photo={heroPhoto ? photoUrl(heroPhoto) : undefined}
        />
        <NavTile
          to="/reserves"
          icon="hotel"
          label={t("nav.reservations")}
          sublabel={`${db.reservations.items.length}`}
        />
        <NavTile to="/mapes" icon="map" label={t("nav.maps")} sublabel="OSM" />
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-3">
          <span className="text-sm font-semibold text-text">{t("language.label")}</span>
          <div className="flex flex-wrap gap-1">
            {SUPPORTED_LANGUAGES.map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  i18n.language === lng
                    ? "bg-accent-soft text-accent"
                    : "bg-chip text-chip-text"
                }`}
              >
                {LANGUAGE_LABELS[lng]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 active:bg-chip"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text">
          <Icon name={theme === "dark" ? "dark_mode" : "light_mode"} className="h-5 w-5 text-accent" />
          {theme === "dark" ? t("theme.dark") : t("theme.light")}
        </span>
        <Icon name="chevron_left" className="h-5 w-5 rotate-180 text-muted" />
      </button>
    </div>
  );
}
