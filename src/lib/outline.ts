import type { IconName } from "../components/Icon";
import type { DayNode } from "./db";

const TIME_RE = /^\d{1,2}[.:]\d{2}\s*h$/i;

// Las cabeceras recurrentes del itinerario se traducen de forma consistente
// (ver glosario en scripts/translate) para que este matching por regex siga
// funcionando en los 4 idiomas.
const ICONS: [RegExp, IconName][] = [
  [/^(objectiu del dia|goal for the day|objetivo del d[ií]a|今日の目標)$/i, "flag"],
  [/^(allotjament|accommodation|alojamiento|宿泊)$/i, "hotel"],
  [/^(vehicle|veh[ií]culo|車両)$/i, "directions_car"],
  [/^(ruta|route|ルート)$/i, "route"],
  [/^(pressupost aproximat|estimated budget|presupuesto aproximado|概算予算)$/i, "payments"],
  [/^(fitxa del dia|day summary|ficha del d[ií]a|本日の概要)$/i, "description"],
  [/^(sortida|departure|salida|出発)/i, "flight_takeoff"],
  [/^(arribada|arrival|llegada|到着)/i, "sports_score"],
  [/^(transport|交通手段)/i, "directions_bus"],
  [/^(dist[àa]ncia|distance|distancia|距離)/i, "straighten"],
  [/^(temps (de )?condu|driving time|tiempo conduciendo|運転時間)/i, "schedule"],
  [/^(temps caminant|walking time|tiempo caminando|徒歩時間)/i, "directions_walk"],
  [
    /^(preparaci[oó]|preparar|before you go|checklist|antes de salir|出発前の準備|チェックリスト)/i,
    "checklist",
  ],
];

// Secciones que se muestran como grid de estadisticas compactas en vez de
// lista con vinetas (ver StatGrid en OutlineNode).
const GRID_ICONS: IconName[] = ["payments", "straighten", "schedule", "directions_walk"];

export function isTimeMarker(text: string): boolean {
  return TIME_RE.test(text.trim());
}

export function isChecklistItem(text: string): boolean {
  return text.startsWith("☐");
}

export function stripChecklistMarker(text: string): string {
  return text.replace(/^☐\s*/, "");
}

export function isWarningSection(text: string): boolean {
  return /^(incongru[eè]ncies detectades|inconsistencies found|incongruencias detectadas|矛盾点)$/i.test(
    text.trim(),
  );
}

export function isRecommendationSection(text: string): boolean {
  return /^(la meva recomanaci[oó]|my recommendation|mi recomendaci[oó]n|私のおすすめ)/i.test(
    text.trim(),
  );
}

export function sectionIcon(text: string): IconName | null {
  for (const [re, icon] of ICONS) {
    if (re.test(text.trim())) return icon;
  }
  return null;
}

export function isGridSection(text: string): boolean {
  const icon = sectionIcon(text);
  return icon !== null && GRID_ICONS.includes(icon);
}

// Etiquetas tipo "Comprovar:" / "Check:" que anteceden una lista de cosas
// a verificar - sus hijos absorbidos se muestran como checkboxes.
export function isCheckLabel(text: string): boolean {
  return /(comprovar|comprobar|check|確認)/i.test(text);
}

// Etiquetas tipo "Veure:" / "See:" que anteceden una lista de sitios/cosas
// a visitar - sus hijos absorbidos se muestran como chips, no como pasos.
export function isSightsLabel(text: string): boolean {
  return /^(veure|see|ver|見る|見どころ)\s*[:：]?$/i.test(text.trim());
}

// Lineas tipo "Consell: ..." / "Tip: ..." (consejo suelto dentro de un paso)
const TIP_RE = /^(consell|tip|consejo|sugerencia|advice)\s*[:：]/i;
const TIP_RE_JA = /^(アドバイス|ヒント|コツ)\s*[:：]/;

export function isTipLine(text: string): boolean {
  const t = text.trim();
  return TIP_RE.test(t) || TIP_RE_JA.test(t);
}

export function hasCurrencyMention(text: string): boolean {
  return /[€¥]|\byens?\b|\bien\b/i.test(text);
}

export function hasDurationMention(text: string): boolean {
  return /^(temps|time|tiempo|所要時間|時間)\b/i.test(text.trim());
}

const URL_RE = /https?:\/\/\S+/g;

/** Extrae URLs pegadas dentro del texto (en vez de como campo `link`) para
 * poder mostrarlas como boton en vez de como URL cruda ilegible. */
export function extractInlineLinks(text: string): { clean: string; links: string[] } {
  const links = text.match(URL_RE) ?? [];
  const clean = text.replace(URL_RE, "").replace(/\s{2,}/g, " ").trim();
  return { clean, links };
}

export type GroupKind = "check" | "sights" | "steps" | "plain";

export function groupKind(headerText: string): GroupKind {
  if (isCheckLabel(headerText)) return "check";
  if (isSightsLabel(headerText)) return "sights";
  if (/[:：]$/.test(headerText.trim())) return "steps";
  return "plain";
}

function isAbsorbingHeader(node: DayNode): boolean {
  if (node.children.length > 0 || node.link) return false;
  const text = node.text.trim();
  if (isChecklistItem(text)) return false;
  return (
    sectionIcon(text) !== null ||
    isTimeMarker(text) ||
    isWarningSection(text) ||
    isRecommendationSection(text) ||
    /[:：]$/.test(text)
  );
}

/**
 * El Excel de origen coloca a veces el contenido real de una cabecera
 * (p.ej. "Incongruències detectades" o "Comprovar:") como filas hermanas
 * siguientes en vez de hijas, porque en la hoja de calculo comparten
 * columna. Aqui se reagrupan a nivel de render (sin tocar db.json): toda
 * cabecera "vacia" que matchea un patron conocido absorbe las lineas
 * llanas que la siguen, hasta la proxima cabecera reconocida.
 */
export function regroupTree(nodes: DayNode[]): DayNode[] {
  const result: DayNode[] = [];
  let current: DayNode | null = null;

  for (const original of nodes) {
    if (isAbsorbingHeader(original)) {
      const node: DayNode = { ...original, children: [] };
      result.push(node);
      current = node;
      continue;
    }
    // Una linea de tipo "Consell: ..." nunca se traga dentro del grupo
    // anterior (p.ej. una lista de "Comprovar:") ni empieza uno nuevo.
    if (isTipLine(original.text)) {
      result.push(original);
      current = null;
      continue;
    }
    if (current) {
      current.children.push(original);
    } else {
      result.push(original);
    }
  }

  return result.map((n) => ({ ...n, children: regroupTree(n.children) }));
}

export interface FlatOutlineNode {
  path: string;
  depth: number;
  text: string;
}

/** Aplana el arbol final (tras regroupTree + injecciones) en una lista con
 * un "path" estable por posicion, para el editor de texto de admin. Debe
 * llamarse sobre el mismo arbol que se renderiza, para que los paths
 * coincidan con applyTextOverrides. */
export function flattenWithPaths(
  nodes: DayNode[],
  prefix = "",
  depth = 0,
): FlatOutlineNode[] {
  const out: FlatOutlineNode[] = [];
  nodes.forEach((node, i) => {
    const path = prefix ? `${prefix}-${i}` : `${i}`;
    out.push({ path, depth, text: node.text });
    out.push(...flattenWithPaths(node.children, path, depth + 1));
  });
  return out;
}

/** Sustituye el texto de los nodos indicados por path (ver flattenWithPaths).
 * No toca `link` ni la estructura: solo el contenido visible. */
export function applyTextOverrides(
  nodes: DayNode[],
  overrides: Record<string, string>,
  prefix = "",
): DayNode[] {
  return nodes.map((node, i) => {
    const path = prefix ? `${prefix}-${i}` : `${i}`;
    return {
      ...node,
      text: overrides[path] ?? node.text,
      children: applyTextOverrides(node.children, overrides, path),
    };
  });
}
