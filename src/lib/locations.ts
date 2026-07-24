import type { Db, DayNode } from "./db";
import coordsCache from "../data/coords_cache.json";

const CACHE: Record<string, number[]> = coordsCache;

export interface MapLocation {
  day: string | null;
  name: string;
  link: string;
  coords: [number, number] | null;
}

const MAPS_HOST_RE = /google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/i;
const COORDS_RE = /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/;
const QUERY_COORDS_RE = /[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/;

function extractCoords(link: string): [number, number] | null {
  const cached = CACHE[link];
  if (cached && cached.length === 2) return [cached[0], cached[1]];
  const m = COORDS_RE.exec(link) ?? QUERY_COORDS_RE.exec(link);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

function walk(nodes: DayNode[], day: string | null, out: MapLocation[]) {
  for (const node of nodes) {
    if (node.link && MAPS_HOST_RE.test(node.link)) {
      out.push({
        day,
        name: node.text,
        link: node.link,
        coords: extractCoords(node.link),
      });
    }
    if (node.children.length > 0) walk(node.children, day, out);
  }
}

// Cerca de Google Maps centrada al lloc (amb coordenades) o pel seu nom
// (fallback quan no en tenim coordenades conegudes) — útil per a "lavabo/
// conveni més proper" sense mantenir cap base de dades pròpia de POIs.
export function nearbySearchUrl(loc: MapLocation, query: string): string {
  if (loc.coords) {
    const [lat, lng] = loc.coords;
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},16z`;
  }
  return `https://www.google.com/maps/search/${encodeURIComponent(`${query} near ${loc.name}, Japan`)}`;
}

// Primera coordenada coneguda de cada dia (mateix criteri que "dayCoords" a
// Mapes.tsx), com a punt d'ancoratge per demanar la previsió del temps.
export function getDayAnchorCoords(db: Db): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  for (const loc of getMapLocations(db)) {
    if (loc.day && loc.coords && !out[loc.day]) out[loc.day] = loc.coords;
  }
  return out;
}

const cacheByLang = new Map<Db, MapLocation[]>();

export function getMapLocations(db: Db): MapLocation[] {
  const cached = cacheByLang.get(db);
  if (cached) return cached;
  const out: MapLocation[] = [];

  for (const [day, outline] of Object.entries(db.days)) {
    walk(outline.sections, day, out);
  }

  for (const item of db.reservations.items) {
    if (item.link && MAPS_HOST_RE.test(item.link)) {
      out.push({
        day: null,
        name: item.concept,
        link: item.link,
        coords: extractCoords(item.link),
      });
    }
  }

  cacheByLang.set(db, out);
  return out;
}
