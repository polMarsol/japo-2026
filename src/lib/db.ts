import { useEffect, useState } from "react";
import raw from "../data/db.json";

export interface DayNode {
  text: string;
  link?: string;
  children: DayNode[];
}

export interface DayOutline {
  title: string | null;
  sections: DayNode[];
}

export interface IndexEntry {
  day: number | string;
  date: string | null;
  weekday: string | null;
  route: string | null;
}

export interface ResumEntry {
  day: number | string;
  date: string | null;
  zone: string | null;
  accommodation: string | null;
  accommodationLink: string | null;
  transport: string | null;
  distance: string | null;
}

export interface ReservationItem {
  id: string;
  date: string | null;
  concept: string;
  link: string | null;
  status: string | null;
  statusKey: "paid" | "reserved" | "pending" | "unknown";
  costTotal: number | string | null;
  costPerPerson: number | string | null;
  responsible: string | null;
  notes: string | null;
  notesLink: string | null;
  checkIn: string | null;
  checkInLink: string | null;
  checkOut: string | null;
  checkOutLink: string | null;
}

export interface Db {
  meta: { generatedAt: string; sourceFile: string };
  index: IndexEntry[];
  resum: ResumEntry[];
  reservations: {
    items: ReservationItem[];
    total: { costTotal: number; costPerPerson: number } | null;
    legend: string | null;
  };
  days: Record<string, DayOutline>;
}

// El catalan (idioma original del Excel) va estatico en el bundle principal
// para el primer render instantaneo. Las traducciones (~500kB cada una) se
// cargan bajo demanda al cambiar de idioma, y quedan en cache en memoria.
export const db = raw as Db;

const cache: Partial<Record<string, Db>> = { ca: db };

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  en: () => import("../data/db.en.json"),
  es: () => import("../data/db.es.json"),
  ja: () => import("../data/db.ja.json"),
};

export function useLocalizedDb(lang: string): Db {
  const [data, setData] = useState<Db>(cache[lang] ?? db);

  useEffect(() => {
    const cached = cache[lang];
    if (cached) {
      setData(cached);
      return;
    }
    const loader = loaders[lang];
    if (!loader) {
      setData(db);
      return;
    }
    let cancelled = false;
    loader().then((mod) => {
      const loaded = mod.default as Db;
      cache[lang] = loaded;
      if (!cancelled) setData(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return data;
}

export function getDay(source: Db, dayNumber: number | string): DayOutline | undefined {
  return source.days[String(dayNumber)];
}
