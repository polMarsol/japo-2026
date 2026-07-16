// Reconcilia las traducciones (en/es/ja) tras una actualizacion del Excel,
// SIN traducir nada nuevo automaticamente (esa parte quedo parada a
// proposito). Lo que hace:
//
//  - Reservas: empareja cada reserva nueva con la antigua por su "id"
//    estable (fecha+concepto), y le copia el concept/status ya traducidos.
//    Las reservas nuevas (sin pareja) se quedan en catalan hasta traducirlas.
//  - Dias: si el contenido catalan de un dia no ha cambiado respecto a la
//    version anterior, mantiene la traduccion ya existente tal cual. Si ha
//    cambiado (o es nuevo), usa el catalan de relleno y lo lista al final
//    como pendiente de traducir.
//  - index/resum/legend no se tocan (esas hojas no cambian con las
//    actualizaciones de dias/reservas).
//
// Uso:
//   node scripts/sync_translations.mjs <db_catalan_anterior.json>
//
// El catalan anterior se genera con:
//   python scripts/extract_excel.py "excel_viejo.xlsx" ruta_temporal.json

import fs from "node:fs";
import path from "node:path";

const oldCaPath = process.argv[2];
if (!oldCaPath) {
  console.error("Uso: node scripts/sync_translations.mjs <db_catalan_anterior.json>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const oldCa = JSON.parse(fs.readFileSync(oldCaPath, "utf-8"));
const newCa = JSON.parse(fs.readFileSync(path.join(root, "src/data/db.json"), "utf-8"));

const LANGS = ["en", "es", "ja"];

function sameOutline(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

for (const lang of LANGS) {
  const filePath = path.join(root, `src/data/db.${lang}.json`);
  const oldTranslated = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Reservas: mapa id-antiguo -> texto traducido, por posicion (los arrays
  // catalan/traducido siempre se generaron alineados 1:1 por indice).
  const idToTranslated = {};
  oldCa.reservations.items.forEach((item, i) => {
    const translated = oldTranslated.reservations.items[i];
    if (translated) {
      idToTranslated[item.id] = { concept: translated.concept, status: translated.status };
    }
  });

  const untranslatedReservations = [];
  const newItems = newCa.reservations.items.map((item) => {
    const t = idToTranslated[item.id];
    if (!t) untranslatedReservations.push(item.id);
    return { ...item, concept: t?.concept ?? item.concept, status: t?.status ?? item.status };
  });

  // Dias: si el arbol catalan no cambio, se conserva la traduccion vigente.
  const newDays = {};
  const untranslatedDays = [];
  for (const dayNum of Object.keys(newCa.days)) {
    const unchanged =
      oldCa.days[dayNum] && sameOutline(oldCa.days[dayNum], newCa.days[dayNum]);
    if (unchanged) {
      newDays[dayNum] = oldTranslated.days[dayNum];
    } else {
      newDays[dayNum] = newCa.days[dayNum];
      untranslatedDays.push(dayNum);
    }
  }

  const result = {
    ...oldTranslated,
    meta: newCa.meta,
    reservations: {
      items: newItems,
      total: newCa.reservations.total,
      legend: oldTranslated.reservations.legend,
    },
    days: newDays,
  };

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2) + "\n", "utf-8");

  console.log(`\n[${lang}] escrito: ${filePath}`);
  if (untranslatedDays.length) {
    console.log(`  Dias pendientes de traducir (de momento en catalan): ${untranslatedDays.join(", ")}`);
  }
  if (untranslatedReservations.length) {
    console.log(`  Reservas nuevas pendientes de traducir: ${untranslatedReservations.join(", ")}`);
  }
}

console.log("\nOK: traducciones reconciliadas.");
