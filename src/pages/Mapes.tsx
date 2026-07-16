import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { getMapLocations } from "../lib/locations";
import { useLocalizedDb } from "../lib/db";
import { Icon } from "../components/Icon";

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

export function Mapes() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const locations = useMemo(() => getMapLocations(db), [db]);
  const pinned = locations.filter((l) => l.coords);
  const grouped = useMemo(() => groupByDay(locations), [locations]);

  // Centro aproximado de Japon como fallback si aun no hay marcadores.
  const center: [number, number] = pinned[0]?.coords ?? [35.0, 135.5];

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <h1 className="text-2xl font-semibold text-text">{t("maps.title")}</h1>

      <p className="rounded-xl border border-dashed border-line p-3 text-xs leading-relaxed text-muted">
        {t("maps.offlineNotice", { pinned: pinned.length, total: locations.length })}
      </p>

      <div className="h-72 overflow-hidden rounded-xl border border-line">
        <MapContainer
          center={center}
          zoom={pinned.length ? 6 : 5}
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
        </MapContainer>
      </div>

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
