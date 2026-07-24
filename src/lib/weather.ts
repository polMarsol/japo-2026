import { useEffect, useMemo, useState } from "react";
import type { Db } from "./db";
import { getDayAnchorCoords } from "./locations";
import type { IconName } from "../components/Icon";

// Previsio via Open-Meteo (open-meteo.com): gratuita, sense API key, fins a
// 16 dies vista, i permet consultar moltes coordenades en una sola petició
// (batching). Mateix patró que exchangeRate.ts: fetch + cache a localStorage
// amb caducitat, i ens quedem amb el darrer valor conegut si no hi ha xarxa.
const API_URL = "https://api.open-meteo.com/v1/forecast";
export const FUJI_COORDS: [number, number] = [35.3606, 138.7274];
const STALE_MS = 3 * 60 * 60 * 1000;
const DAILY_KEY = "japo2026:weatherDaily";
const HOURLY_KEY_PREFIX = "japo2026:weatherHourly:";

const DAILY_VARS = [
  "weathercode",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_probability_max",
  "precipitation_sum",
  "uv_index_max",
  "wind_speed_10m_max",
  "sunrise",
  "sunset",
  "cloud_cover_mean",
].join(",");

const HOURLY_VARS = ["temperature_2m", "weathercode", "precipitation_probability", "relative_humidity_2m"].join(
  ",",
);

export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number | null;
  tempMin: number | null;
  feelsLikeMax: number | null;
  feelsLikeMin: number | null;
  precipProbability: number | null;
  precipSum: number | null;
  uvIndexMax: number | null;
  windSpeedMax: number | null;
  sunrise: string | null;
  sunset: string | null;
  cloudCoverMean: number | null;
}

export interface HourlyWeather {
  time: string;
  temp: number | null;
  weatherCode: number;
  precipProbability: number | null;
  humidity: number | null;
}

interface OpenMeteoDaily {
  time: string[];
  weathercode?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  precipitation_probability_max?: number[];
  precipitation_sum?: number[];
  uv_index_max?: number[];
  wind_speed_10m_max?: number[];
  sunrise?: string[];
  sunset?: string[];
  cloud_cover_mean?: number[];
}

interface OpenMeteoHourly {
  time: string[];
  temperature_2m?: number[];
  weathercode?: number[];
  precipitation_probability?: number[];
  relative_humidity_2m?: number[];
}

interface LocationForecast {
  key: string;
  daily: DailyWeather[];
}

interface CachedDaily {
  fetchedAt: string;
  locations: LocationForecast[];
}

interface CachedHourly {
  fetchedAt: string;
  hours: HourlyWeather[];
}

function coordKey([lat, lng]: [number, number]): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function parseDaily(d: OpenMeteoDaily | undefined): DailyWeather[] {
  if (!d?.time) return [];
  return d.time.map((date, i) => ({
    date,
    weatherCode: d.weathercode?.[i] ?? 0,
    tempMax: d.temperature_2m_max?.[i] ?? null,
    tempMin: d.temperature_2m_min?.[i] ?? null,
    feelsLikeMax: d.apparent_temperature_max?.[i] ?? null,
    feelsLikeMin: d.apparent_temperature_min?.[i] ?? null,
    precipProbability: d.precipitation_probability_max?.[i] ?? null,
    precipSum: d.precipitation_sum?.[i] ?? null,
    uvIndexMax: d.uv_index_max?.[i] ?? null,
    windSpeedMax: d.wind_speed_10m_max?.[i] ?? null,
    sunrise: d.sunrise?.[i] ?? null,
    sunset: d.sunset?.[i] ?? null,
    cloudCoverMean: d.cloud_cover_mean?.[i] ?? null,
  }));
}

function parseHourly(d: OpenMeteoHourly | undefined): HourlyWeather[] {
  if (!d?.time) return [];
  return d.time.map((time, i) => ({
    time,
    temp: d.temperature_2m?.[i] ?? null,
    weatherCode: d.weathercode?.[i] ?? 0,
    precipProbability: d.precipitation_probability?.[i] ?? null,
    humidity: d.relative_humidity_2m?.[i] ?? null,
  }));
}

/** Previsió diària (16 dies) per a totes les ubicacions dels dies del viatge
 * + el cim del Fuji, en una sola petició batched. */
export function useDailyForecast(db: Db) {
  const dayAnchors = useMemo(() => getDayAnchorCoords(db), [db]);

  const uniqueCoords = useMemo(() => {
    const seen = new Map<string, [number, number]>();
    for (const coords of Object.values(dayAnchors)) seen.set(coordKey(coords), coords);
    seen.set(coordKey(FUJI_COORDS), FUJI_COORDS);
    return [...seen.entries()];
  }, [dayAnchors]);

  const coordsSignature = uniqueCoords.map(([k]) => k).join("|");

  const [cached, setCached] = useState<CachedDaily | null>(() => readJson(DAILY_KEY));
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (uniqueCoords.length === 0) return;
    setLoading(true);
    try {
      const lats = uniqueCoords.map(([, c]) => c[0]).join(",");
      const lngs = uniqueCoords.map(([, c]) => c[1]).join(",");
      const url = `${API_URL}?latitude=${lats}&longitude=${lngs}&daily=${DAILY_VARS}&forecast_days=16&timezone=Asia%2FTokyo`;
      const res = await fetch(url);
      const data = await res.json();
      const results: { daily?: OpenMeteoDaily }[] = Array.isArray(data) ? data : [data];
      const locations: LocationForecast[] = results.map((r, i) => ({
        key: uniqueCoords[i][0],
        daily: parseDaily(r.daily),
      }));
      const entry: CachedDaily = { fetchedAt: new Date().toISOString(), locations };
      localStorage.setItem(DAILY_KEY, JSON.stringify(entry));
      setCached(entry);
    } catch {
      // sense xarxa: ens quedem amb el que hi hagi a cache (o res)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const isStale = !cached || Date.now() - new Date(cached.fetchedAt).getTime() > STALE_MS;
    if (isStale && uniqueCoords.length > 0) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsSignature]);

  function forecastFor(coords: [number, number] | null): DailyWeather[] | null {
    if (!coords) return null;
    const loc = cached?.locations.find((l) => l.key === coordKey(coords));
    return loc?.daily ?? null;
  }

  function getDayForecast(day: string): DailyWeather[] | null {
    return forecastFor(dayAnchors[day] ?? null);
  }

  function getFujiForecast(): DailyWeather[] | null {
    return forecastFor(FUJI_COORDS);
  }

  return {
    dayAnchors,
    getDayForecast,
    getFujiForecast,
    loading,
    fetchedAt: cached?.fetchedAt ?? null,
    refresh,
  };
}

/** Detall horari, a demanda, nomes per al dia seleccionat (petició petita i
 * cacheada per separat perque no cal descarregar-ho tot per endavant). */
export function useHourlyForecast(coords: [number, number] | null, date: string | null) {
  const key = coords && date ? `${HOURLY_KEY_PREFIX}${coordKey(coords)}:${date}` : null;
  const [cached, setCached] = useState<CachedHourly | null>(() => (key ? readJson(key) : null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCached(key ? readJson(key) : null);
    if (!coords || !date || !key) return;
    const existing = readJson<CachedHourly>(key);
    const isStale = !existing || Date.now() - new Date(existing.fetchedAt).getTime() > STALE_MS;
    if (!isStale) return;

    let cancelled = false;
    setLoading(true);
    const [lat, lng] = coords;
    const url = `${API_URL}?latitude=${lat}&longitude=${lng}&hourly=${HOURLY_VARS}&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
    fetch(url)
      .then((res) => res.json())
      .then((data: { hourly?: OpenMeteoHourly }) => {
        if (cancelled) return;
        const entry: CachedHourly = { fetchedAt: new Date().toISOString(), hours: parseHourly(data.hourly) };
        localStorage.setItem(key, JSON.stringify(entry));
        setCached(entry);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, coords, date]);

  return { hours: cached?.hours ?? null, loading };
}

/** Tria el dia per defecte a mostrar: el d'avui si ja té ubicació coneguda,
 * si no el primer dia del viatge que en tingui (dies com el "Dia 0" de
 * trasllat solen no tenir cap lloc mapejat encara). */
export function pickGlanceDay<T extends { day: number | string; date: string | null }>(
  trip: T[],
  dayAnchors: Record<string, [number, number]>,
): T | undefined {
  const todayStr = new Date().toISOString().slice(0, 10);
  return (
    trip.find((e) => e.date === todayStr && dayAnchors[String(e.day)]) ??
    trip.find((e) => dayAnchors[String(e.day)]) ??
    trip[0]
  );
}

export function weatherCodeToIcon(code: number): IconName {
  if (code === 0) return "wb_sunny";
  if (code === 1 || code === 2) return "partly_cloudy_day";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "rainy_light";
  if ([61, 63, 66].includes(code)) return "rainy";
  if ([65, 67, 80, 81, 82].includes(code)) return "rainy_heavy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "weather_snowy";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "cloud";
}

export type FujiVisibility = "clear" | "partial" | "hidden";

/** Estimació pròpia (no una dada oficial) a partir de la cobertura mitjana
 * de núvols sobre el cim, nomes per donar una idea abans de mirar la webcam. */
export function estimateFujiVisibility(cloudCoverMean: number | null): FujiVisibility {
  if (cloudCoverMean == null) return "hidden";
  if (cloudCoverMean < 30) return "clear";
  if (cloudCoverMean < 70) return "partial";
  return "hidden";
}

/** Ids de packing.items.* a suggerir segons llindars simples del dia. */
export function packingTipsForDay(d: DailyWeather): string[] {
  const tips: string[] = [];
  if (d.precipProbability != null && d.precipProbability >= 40) tips.push("rain-jacket");
  if (d.uvIndexMax != null && d.uvIndexMax >= 6) tips.push("reef-safe-sunscreen");
  return tips;
}
