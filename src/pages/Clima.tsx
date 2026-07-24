import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import {
  estimateFujiVisibility,
  packingTipsForDay,
  pickGlanceDay,
  useDailyForecast,
  useHourlyForecast,
  weatherCodeToIcon,
  type DailyWeather,
} from "../lib/weather";
import { getPlacePhoto, photoUrl } from "../lib/photos";
import { Icon, type IconName } from "../components/Icon";

const FUJI_VIDEO_ID = "i3SL2jbBK2k";
const FUJI_SEARCH_URL = "https://www.youtube.com/results?search_query=mount+fuji+live+camera";

function hm(iso: string | null): string {
  return iso ? iso.slice(11, 16) : "--:--";
}

function round(n: number | null): string {
  return n == null ? "–" : String(Math.round(n));
}

function StatRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-chip px-3 py-2.5 text-center">
      <Icon name={icon} className="h-5 w-5 text-accent" />
      <span className="text-sm font-semibold text-text">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}

export function Clima() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const trip = useMemo(() => db.index.filter((e) => e.date), [db]);

  const { dayAnchors, getDayForecast, getFujiForecast, loading, fetchedAt } = useDailyForecast(db);

  const [selectedDay, setSelectedDay] = useState(() => String(pickGlanceDay(trip, dayAnchors)?.day ?? "1"));

  const entry = trip.find((e) => String(e.day) === selectedDay);
  const coords = dayAnchors[selectedDay] ?? null;
  const dailyList = getDayForecast(selectedDay);
  const forecast: DailyWeather | null = entry?.date
    ? (dailyList?.find((d) => d.date === entry.date) ?? null)
    : null;

  const { hours } = useHourlyForecast(forecast ? coords : null, forecast?.date ?? null);

  const fujiToday = getFujiForecast()?.[0] ?? null;
  const fujiPhoto = getPlacePhoto("Mont Fuji");
  const visibility = estimateFujiVisibility(fujiToday?.cloudCoverMean ?? null);

  const tips = forecast ? packingTipsForDay(forecast) : [];

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">{t("weather.title")}</h1>
        <p className="text-xs text-muted">{t("weather.subtitle")}</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {trip.map((e) => (
          <button
            key={String(e.day)}
            type="button"
            onClick={() => setSelectedDay(String(e.day))}
            className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-1.5 text-xs font-medium ${
              selectedDay === String(e.day) ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            <span>{t("days.day")} {e.day}</span>
            <span className="opacity-75">{e.date?.slice(5)}</span>
          </button>
        ))}
      </div>

      {!forecast ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-4 text-center text-sm text-muted">
          {coords ? t("weather.noForecastYet") : t("weather.noLocation")}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <Icon name={weatherCodeToIcon(forecast.weatherCode)} className="h-12 w-12 text-accent" />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-text">
                {round(forecast.tempMax)}° / {round(forecast.tempMin)}°
              </span>
              <span className="text-xs text-muted">
                {t("weather.feelsLike")} {round(forecast.feelsLikeMax)}° / {round(forecast.feelsLikeMin)}°
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <StatRow icon="umbrella" label={t("weather.rain")} value={`${round(forecast.precipProbability)}%`} />
            <StatRow icon="wb_sunny" label={t("weather.uv")} value={round(forecast.uvIndexMax)} />
            <StatRow icon="wind_power" label={t("weather.wind")} value={`${round(forecast.windSpeedMax)} km/h`} />
            <StatRow icon="water_drop" label={t("weather.precip")} value={`${round(forecast.precipSum)} mm`} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Icon name="wb_twilight" className="h-3.5 w-3.5" />
              {hm(forecast.sunrise)}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="wb_twilight" className="h-3.5 w-3.5" />
              {hm(forecast.sunset)}
            </span>
          </div>

          {tips.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-line pt-3">
              <span className="text-xs font-medium text-text">{t("weather.tipsIntro")}</span>
              <div className="flex flex-wrap gap-1.5">
                {tips.map((id) => (
                  <span
                    key={id}
                    className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
                  >
                    <Icon name={id === "rain-jacket" ? "umbrella" : "wb_sunny"} className="h-3.5 w-3.5" />
                    {t(`packing.items.${id}`)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hours && hours.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-t border-line pt-3">
              {hours.map((h) => (
                <div key={h.time} className="flex shrink-0 flex-col items-center gap-1 text-xs text-text">
                  <span className="text-muted">{hm(h.time)}</span>
                  <Icon name={weatherCodeToIcon(h.weatherCode)} className="h-4 w-4 text-accent" />
                  <span className="font-medium">{round(h.temp)}°</span>
                  <span className="text-[10px] text-muted">{round(h.precipProbability)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && !forecast && <p className="text-center text-xs text-muted">{t("weather.loading")}</p>}
      {fetchedAt && (
        <p className="text-center text-[11px] text-muted">
          {t("weather.updated", { time: new Date(fetchedAt).toLocaleString(i18n.language) })}
        </p>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
          <Icon name="visibility" className="h-[18px] w-[18px]" />
          {t("weather.fuji.title")}
        </h2>

        {fujiPhoto && (
          <img
            src={photoUrl(fujiPhoto)}
            alt="Mont Fuji"
            loading="lazy"
            className="h-40 w-full rounded-xl object-cover"
          />
        )}

        <div className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2 text-sm text-text">
          <Icon name="visibility" className="h-4 w-4 shrink-0 text-accent" />
          {t(`weather.fuji.visibility.${visibility}`)}
        </div>
        <p className="text-[11px] leading-relaxed text-muted">{t("weather.fuji.visibilityDisclaimer")}</p>

        <div className="overflow-hidden rounded-xl border border-line">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${FUJI_VIDEO_ID}?autoplay=0`}
              title="Mount Fuji live camera"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <a
          href={FUJI_SEARCH_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-medium text-muted"
        >
          <Icon name="open_in_new" className="h-3.5 w-3.5" />
          {t("weather.fuji.otherCameras")}
        </a>
      </section>
    </div>
  );
}
