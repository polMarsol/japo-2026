import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { getMapLocations } from "../lib/locations";
import { useLocalizedDb } from "../lib/db";
import { getDayRouteLegs, formatDistance, formatDuration, type RouteMode } from "../lib/routes";
import { tilesForCoords, downloadTiles } from "../lib/offlineTiles";
import { Icon } from "../components/Icon";

const DOWNLOADED_KEY = "japo2026:mapsDownloaded";
const ROUTE_COLOR: Record<RouteMode, string> = { foot: "#2563eb", car: "#f97316" };

const pinIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#ef4444;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function groupByDay(locations: ReturnType<typeof getMapLocations>) {
  const groups = new Map<string, typeof locations>();
  for (const loc of locations) {
    const key = loc.day ?? "reserves";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(loc);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "reserves") return 1;
    if (b === "reserves") return -1;
    return Number(a) - Number(b);
  });
}

function loadDownloadedDays(): Set<string> {
  try {
    const raw = localStorage.getItem(DOWNLOADED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function Mapes() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const locations = useMemo(() => getMapLocations(db), [db]);
  const pinned = useMemo(() => locations.filter((l) => l.coords), [locations]);
  const grouped = useMemo(() => groupByDay(locations), [locations]);

  const pinnedDays = useMemo(() => {
    const days = new Set<string>();
    for (const l of pinned) if (l.day) days.add(l.day);
    return [...days].sort((a, b) => Number(a) - Number(b));
  }, [pinned]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [mode, setMode] = useState<RouteMode>("foot");
  const [downloadedDays, setDownloadedDays] = useState<Set<string>>(loadDownloadedDays);
  const [downloadState, setDownloadState] = useState<{ key: string; done: number; total: number } | null>(null);

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  function markDownloaded(day: string) {
    setDownloadedDays((prev) => {
      const next = new Set(prev);
      next.add(day);
      localStorage.setItem(DOWNLOADED_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  async function handleDownloadDay(day: string) {
    const coords = pinned
      .filter((l) => l.day === day)
      .map((l) => l.coords!) as [number, number][];
    const tiles = tilesForCoords(coords);
    setDownloadState({ key: day, done: 0, total: tiles.length });
    await downloadTiles(tiles, (done, total) => setDownloadState({ key: day, done, total }));
    setDownloadState(null);
    markDownloaded(day);
  }

  async function handleDownloadAll() {
    for (const day of pinnedDays) {
      if (downloadedDays.has(day)) continue;
      await handleDownloadDay(day);
    }
  }

  const legs = selectedDay ? getDayRouteLegs(selectedDay) : [];

  const dayCoords = useMemo(
    () =>
      selectedDay
        ? (pinned.filter((l) => l.day === selectedDay).map((l) => l.coords!) as [number, number][])
        : [],
    [pinned, selectedDay],
  );

  // Centro aproximado de Japon como fallback si aun no hay marcadores.
  const center: [number, number] =
    selectedDay && dayCoords.length ? dayCoords[0] : pinned[0]?.coords ?? [35.0, 135.5];
  const zoom = selectedDay ? 13 : pinned.length ? 6 : 5;

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <h1 className="text-2xl font-semibold text-text">{t("maps.title")}</h1>

      <p className="rounded-xl border border-dashed border-line p-3 text-xs leading-relaxed text-muted">
        {t("maps.offlineNotice", { pinned: pinned.length, total: locations.length })}
      </p>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedDay(null)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
            selectedDay === null ? "bg-accent text-white" : "bg-chip text-chip-text"
          }`}
        >
          {t("maps.overview")}
        </button>
        {pinnedDays.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
              selectedDay === day ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            {t("days.day")} {day}
            {downloadedDays.has(day) && <Icon name="check_circle" className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <div className="h-72 overflow-hidden rounded-xl border border-line">
        <MapContainer
          key={selectedDay ?? "overview"}
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pinned.map((loc, i) => (
            <Marker key={i} position={loc.coords!} icon={pinIcon}>
              <Popup>
                <span className="font-medium">{loc.name}</span>
                <br />
                <a href={loc.link} target="_blank" rel="noreferrer">
                  {t("maps.openInMaps")}
                </a>
              </Popup>
            </Marker>
          ))}
          {legs.map((leg, i) => {
            const info = leg[mode];
            if (!info) return null;
            return (
              <Polyline
                key={i}
                positions={info.geometry}
                pathOptions={{ color: ROUTE_COLOR[mode], weight: 4, opacity: 0.8 }}
              />
            );
          })}
        </MapContainer>
      </div>

      {selectedDay && (
        <section className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text">{t("maps.dayRoute")}</h2>
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-line">
              {(["foot", "car"] as RouteMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium ${
                    mode === m ? "bg-accent text-white" : "bg-surface text-muted"
                  }`}
                >
                  <Icon name={m === "foot" ? "directions_walk" : "directions_car"} className="h-3.5 w-3.5" />
                  {t(`maps.mode.${m}`)}
                </button>
              ))}
            </div>
          </div>

          {legs.length === 0 ? (
            <p className="text-xs text-muted">{t("maps.noRoute")}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {legs.map((leg, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-xs text-text">
                  <span className="truncate">
                    {leg.from} → {leg.to}
                  </span>
                  <span className="shrink-0 text-muted">
                    {leg[mode]
                      ? `${formatDistance(leg[mode]!.distanceM)} · ${formatDuration(leg[mode]!.durationS)}`
                      : t("maps.noRoute")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={downloadedDays.has(selectedDay) || downloadState !== null}
            onClick={() => handleDownloadDay(selectedDay)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-chip py-2 text-xs font-medium text-chip-text disabled:opacity-50"
          >
            <Icon name="download" className="h-3.5 w-3.5" />
            {downloadState?.key === selectedDay
              ? t("maps.downloading", { done: downloadState.done, total: downloadState.total })
              : downloadedDays.has(selectedDay)
                ? t("maps.downloaded")
                : t("maps.downloadDay")}
          </button>
        </section>
      )}

      <button
        type="button"
        onClick={handleDownloadAll}
        disabled={downloadState !== null}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-medium text-muted disabled:opacity-50"
      >
        <Icon name="download" className="h-3.5 w-3.5" />
        {downloadState
          ? t("maps.downloading", { done: downloadState.done, total: downloadState.total })
          : t("maps.downloadAll")}
      </button>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          {t("maps.placesByDay")}
        </h2>
        {grouped.map(([day, items]) => (
          <details key={day} className="rounded-xl border border-line bg-surface p-3">
            <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-text">
              {day === "reserves" ? (
                <>
                  <Icon name="hotel" className="h-4 w-4" />
                  {t("maps.reservationsGroup")}
                </>
              ) : (
                <>
                  <Icon name="calendar_month" className="h-4 w-4" />
                  {t("days.day")} {day}
                </>
              )}
              <span className="text-muted">({items.length})</span>
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {items.map((loc, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm text-text"
                >
                  <span className="flex items-center gap-1.5">
                    {loc.coords && <span className="text-accent">●</span>}
                    {loc.name}
                  </span>
                  <a
                    href={loc.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
                  >
                    <Icon name="location_on" className="h-3.5 w-3.5" />
                    {t("maps.openInMaps")}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </section>
    </div>
  );
}
