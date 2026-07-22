import routesData from "../data/routes.json";

export type RouteMode = "foot" | "car";

export interface RouteModeInfo {
  distanceM: number;
  durationS: number;
  geometry: [number, number][];
}

export interface RouteLeg {
  from: string;
  to: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  foot: RouteModeInfo | null;
  car: RouteModeInfo | null;
}

const DATA = routesData as unknown as Record<string, RouteLeg[]>;

export function getDayRouteLegs(day: string): RouteLeg[] {
  return DATA[day] ?? [];
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatDuration(s: number): string {
  const totalMin = Math.round(s / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return min > 0 ? `${h} h ${min} min` : `${h} h`;
}
