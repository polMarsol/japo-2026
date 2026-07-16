import type { Db, DayNode } from "./db";

const HOTEL_KEYWORDS =
  /hotel|shukub|temple|wisterian|lanternhouse|guesthouse|guest house|inn\b|condominium|riyuka|toyoko|seapa|hanayado/i;
// La mayoria de reservas de alojamiento enlazan a una web de reservas de
// hoteles, incluso cuando el concepto solo lleva el nombre del lugar
// (p.ej. "Takachiho (2-3 ago)" sin la palabra "hotel").
const BOOKING_DOMAINS = /booking\.com|hoteles\.com|agoda\.|airbnb\./i;

function parseDaysFromConcept(concept: string): number[] {
  const m = concept.match(/\(([^)]*)\)/);
  if (!m) return [];
  const inner = m[1];
  const nums = (inner.match(/\d+/g) ?? []).map(Number);

  // Rango tipo "4-6 agost" (exactamente 2 numeros unidos por un guion):
  // expandir a [4,5,6], no solo los extremos. Listas como "14-15-16" o
  // "19 i 20" no entran aqui (no matchean el patron de un unico guion).
  if (nums.length === 2 && /^\D*\d+\s*-\s*\d+\D*$/.test(inner)) {
    const [from, to] = nums;
    if (from <= to && to - from <= 10) {
      const days: number[] = [];
      for (let d = from; d <= to; d++) days.push(d);
      return days.filter((n) => n >= 0 && n <= 21);
    }
  }

  return nums.filter((n) => n >= 0 && n <= 21);
}

/** Dia (com a string) -> enllaç de la reserva d'allotjament d'aquell dia,
 * deduit dels indicadors "(N ago)"/"(N-M ago)" que ja porten els conceptes
 * de RESERVES. Nomes la primera reserva d'allotjament trobada per dia. */
export function buildAccommodationLinkMap(db: Db): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of db.reservations.items) {
    if (!item.link) continue;
    const looksLikeStay = HOTEL_KEYWORDS.test(item.concept) || BOOKING_DOMAINS.test(item.link);
    if (!looksLikeStay) continue;
    for (const day of parseDaysFromConcept(item.concept)) {
      const key = String(day);
      if (!map[key]) map[key] = item.link;
    }
  }
  return map;
}

const ACCOMMODATION_HEADER_RE = /^(allotjament|accommodation|alojamiento|宿泊)/i;

/** Si la secció "Allotjament" del dia no té cap enllaç en el seu primer
 * fill (el nom de l'hotel), hi enganxa el de la reserva corresponent. */
export function injectAccommodationLink(
  sections: DayNode[],
  link: string | undefined,
): DayNode[] {
  if (!link) return sections;
  return sections.map((section) => {
    if (!ACCOMMODATION_HEADER_RE.test(section.text.trim())) return section;
    if (section.children.length === 0) return section;
    const [first, ...rest] = section.children;
    if (first.link) return section;
    return { ...section, children: [{ ...first, link }, ...rest] };
  });
}
