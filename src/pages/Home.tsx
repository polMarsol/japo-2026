import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { useDayProgress } from "../lib/dayState";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { getDayHeroPhoto, photoUrl } from "../lib/photos";
import { Icon, type IconName } from "../components/Icon";
import { BackpackGauge } from "../components/BackpackGauge";
import { SUPPORTED_LANGUAGES } from "../i18n/resources";
import { PACKING_ITEMS } from "../lib/packingItems";
import { TRAVELERS } from "../lib/travelers";
import { usePackingChecks } from "../lib/packingSync";
import { pickGlanceDay, useDailyForecast, weatherCodeToIcon } from "../lib/weather";
import { useTripPhotos } from "../lib/tripPhotosSync";

const LANGUAGE_LABELS: Record<string, string> = { ca: "CA", en: "EN", es: "ES", ja: "JA" };
const GOOGLE_DRIVE_URL = "https://drive.google.com/drive/folders/1SpetvZQUJlj3Zdr0TAmTmcd-KcgLlXr2?usp=drive_link";

function NavTile({
  to,
  icon,
  label,
  sublabel,
  photo,
  visual,
  visualIsPhoto,
}: {
  to: string;
  icon: IconName;
  label: string;
  sublabel: string;
  photo?: string;
  visual?: ReactNode;
  /** El visual és una foto real (p.ex. la graella de l'àlbum), no un patró
   * controlat com TileDecor: necessita el vel fosc + text blanc perquè el
   * contrast no depèn del contingut imprevisible de la foto. */
  visualIsPhoto?: boolean;
}) {
  const isPhotoLike = Boolean(photo) || (Boolean(visual) && visualIsPhoto);
  const hasVisual = Boolean(visual);
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
      ) : visual ? (
        <>
          {visual}
          {visualIsPhoto && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          )}
        </>
      ) : (
        <Icon name={icon} className="absolute right-3 top-3 h-6 w-6 text-accent" />
      )}
      <span
        className={`relative z-10 flex items-center gap-1.5 text-sm font-semibold ${
          isPhotoLike ? "text-white" : "text-text"
        }`}
      >
        {hasVisual && <Icon name={icon} className={`h-4 w-4 ${isPhotoLike ? "" : "text-accent"}`} />}
        {label}
      </span>
      <span className={`relative z-10 text-xs ${isPhotoLike ? "text-white/70" : "text-muted"}`}>
        {sublabel}
      </span>
    </Link>
  );
}

/** Fons decoratiu per a tiles sense foto: degradat suau (gris/vermell fluix,
 * evocant la bandera de Japó) + icona gran de marca d'aigua, perquè cap
 * secció quedi amb una targeta plana i buida. Fet amb les mateixes variables
 * de color que la resta de l'app (accent-soft, chip) perquè s'adapti sol al
 * tema clar/fosc, igual que qualsevol altra targeta de bg-surface. */
function TileDecor({ icon }: { icon: IconName }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-accent-soft to-chip" />
      <Icon name={icon} className="absolute -right-3 -top-3 h-20 w-20 text-accent/25" />
    </>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-chip py-2">
      <span className="text-lg font-bold tabular-nums text-text">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}

export function Home() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const { theme, toggle } = useTheme();
  const { lock } = useAuth();
  const trip = db.index.filter((e) => e.date);
  const totalDays = Object.keys(db.days).length;
  const { count } = useDayProgress();
  const progressPct = totalDays ? Math.round((count / totalDays) * 100) : 0;
  const heroPhoto = getDayHeroPhoto(i18n.language, "1");

  const { rows: packingRows } = usePackingChecks();
  const packingByPerson = TRAVELERS.map((p) => {
    const checked = PACKING_ITEMS.filter((i) => Boolean(packingRows[`${p}:${i.id}`])).length;
    return { person: p, checked, progress: PACKING_ITEMS.length ? checked / PACKING_ITEMS.length : 0 };
  });
  const packingCompleteCount = packingByPerson.filter((p) => p.checked === PACKING_ITEMS.length).length;

  const { dayAnchors, getDayForecast } = useDailyForecast(db);
  const glanceEntry = pickGlanceDay(trip, dayAnchors);
  const glanceDaily = glanceEntry ? getDayForecast(String(glanceEntry.day)) : null;
  const glanceForecast = glanceDaily?.find((d) => d.date === glanceEntry?.date) ?? null;

  const { list: albumPhotos } = useTripPhotos();
  const recentPhotos = albumPhotos.slice(0, 4);

  const weatherIcon = glanceForecast ? weatherCodeToIcon(glanceForecast.weatherCode) : "wb_sunny";

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDate = trip[0]?.date ?? null;
  const lastDate = trip[trip.length - 1]?.date ?? null;
  const firstDateTime = firstDate ? new Date(`${firstDate}T00:00:00Z`).getTime() : null;

  const [now, setNow] = useState(() => Date.now());
  const isCountingDown = firstDateTime !== null && firstDateTime > now;

  useEffect(() => {
    if (!isCountingDown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isCountingDown]);

  const msRemaining = isCountingDown ? firstDateTime! - now : 0;
  const remDays = Math.floor(msRemaining / 86_400_000);
  const remHours = Math.floor((msRemaining % 86_400_000) / 3_600_000);
  const remMinutes = Math.floor((msRemaining % 3_600_000) / 60_000);
  const remSeconds = Math.floor((msRemaining % 60_000) / 1000);

  const tripFinished = lastDate ? new Date(todayStr).getTime() > new Date(lastDate).getTime() : false;
  const todayEntry = trip.find((e) => e.date === todayStr);
  const todayResum = todayEntry ? db.resum.find((r) => String(r.day) === String(todayEntry.day)) : undefined;
  const todayForecastList = todayEntry ? getDayForecast(String(todayEntry.day)) : null;
  const todayForecast = todayForecastList?.find((d) => d.date === todayEntry?.date) ?? null;
  const todayWeatherIcon = todayForecast ? weatherCodeToIcon(todayForecast.weatherCode) : null;

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

      {isCountingDown ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <Icon name="flight_takeoff" className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-text">{t("home.countdown")}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <CountdownUnit value={remDays} label={t("home.units.days")} />
            <CountdownUnit value={remHours} label={t("home.units.hours")} />
            <CountdownUnit value={remMinutes} label={t("home.units.minutes")} />
            <CountdownUnit value={remSeconds} label={t("home.units.seconds")} />
          </div>
        </div>
      ) : todayEntry ? (
        <Link
          to={`/dies/${todayEntry.day}`}
          className="flex flex-col gap-2.5 rounded-2xl border border-accent/30 bg-accent-soft p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{t("home.today")}</span>
            <span className="text-xs text-muted">
              {t("days.day")} {todayEntry.day}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold text-text">
                {todayEntry.route ?? todayResum?.zone ?? `${t("days.day")} ${todayEntry.day}`}
              </span>
              {todayResum?.accommodation && (
                <span className="truncate text-xs text-muted">{todayResum.accommodation}</span>
              )}
            </div>
            {todayForecast && todayWeatherIcon && (
              <div className="flex shrink-0 items-center gap-1.5">
                <Icon name={todayWeatherIcon} className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-text">
                  {Math.round(todayForecast.tempMax ?? 0)}° / {Math.round(todayForecast.tempMin ?? 0)}°
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : tripFinished ? (
        <div className="rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted">
          {t("home.tripFinished")}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <NavTile
          to="/dies"
          icon="calendar_month"
          label={t("nav.days")}
          sublabel={t("days.progress", { done: count, total: totalDays })}
          photo={heroPhoto ? photoUrl(heroPhoto) : undefined}
          visual={!heroPhoto ? <TileDecor icon="calendar_month" /> : undefined}
        />
        <NavTile
          to="/reserves"
          icon="hotel"
          label={t("nav.reservations")}
          sublabel={`${db.reservations.items.length}`}
          visual={<TileDecor icon="hotel" />}
        />
        <NavTile to="/mapes" icon="map" label={t("nav.maps")} sublabel="OSM" visual={<TileDecor icon="map" />} />
        <NavTile
          to="/equipatge"
          icon="checklist"
          label={t("nav.packing")}
          sublabel={t("packing.travelersComplete", { done: packingCompleteCount, total: TRAVELERS.length })}
          visual={
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-soft to-chip" />
              <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-1.5 p-3 pb-9">
                {packingByPerson.map(({ person, progress, checked }) => {
                  const complete = checked === PACKING_ITEMS.length;
                  return (
                    <div key={person} className="relative h-7 w-7" title={person}>
                      <BackpackGauge
                        progress={progress}
                        className="h-full w-full"
                        fillClassName={complete ? "text-yellow-400" : "text-accent"}
                        emptyClassName="text-accent/30"
                      />
                      {complete && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          }
        />
        <NavTile
          to="/clima"
          icon={weatherIcon}
          label={t("nav.weather")}
          sublabel={
            glanceForecast?.tempMax != null
              ? `${Math.round(glanceForecast.tempMax)}° / ${Math.round(glanceForecast.tempMin ?? 0)}°`
              : t("weather.title")
          }
          visual={<TileDecor icon={weatherIcon} />}
        />
        <NavTile
          to="/etiqueta"
          icon="temple_buddhist"
          label={t("nav.etiquette")}
          sublabel={t("etiquette.subtitleShort")}
          visual={<TileDecor icon="temple_buddhist" />}
        />
        <NavTile
          to="/album"
          icon="photo_library"
          label={t("nav.album")}
          sublabel={
            albumPhotos.length > 0
              ? t("album.photoCount", { count: albumPhotos.length })
              : t("album.subtitleShort")
          }
          visual={
            recentPhotos.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden bg-chip">
                    {recentPhotos[i] && (
                      <img src={recentPhotos[i].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <TileDecor icon="photo_library" />
            )
          }
          visualIsPhoto={recentPhotos.length > 0}
        />
        <NavTile
          to="/traductor"
          icon="sos"
          label={t("nav.translator")}
          sublabel={t("translator.subtitleShort")}
          visual={<TileDecor icon="sos" />}
        />
      </div>

      <a
        href={GOOGLE_DRIVE_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 active:bg-chip"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon name="folder" className="h-5 w-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text">{t("home.drive.title")}</span>
            <span className="text-xs text-muted">{t("home.drive.subtitle")}</span>
          </span>
        </span>
        <Icon name="open_in_new" className="h-5 w-5 text-muted" />
      </a>

      <div className="flex flex-col justify-between gap-2 rounded-2xl border border-line bg-surface p-3">
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

      <button
        type="button"
        onClick={lock}
        className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 active:bg-chip"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text">
          <Icon name="logout" className="h-5 w-5 text-accent" />
          {t("auth.logout")}
        </span>
      </button>
    </div>
  );
}
