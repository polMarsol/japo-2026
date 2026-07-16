# Actualizar la app cuando cambia el Excel del planning

El Excel original (`.xlsx`) nunca se sube a git (contiene datos personales,
ver `.gitignore`), así que cada vez que os cambien el planning hay que
repetir este proceso a mano.

## 1. Ver qué ha cambiado

Guarda el Excel nuevo en algún sitio (por ejemplo `updates/`) sin borrar el
viejo, y compáralos:

```
python scripts/diff_excel.py "excel_viejo.xlsx" "excel_nuevo.xlsx"
```

Te lista, hoja por hoja, qué celdas tienen texto o enlace distinto. Sirve
para saber de un vistazo si el cambio es "solo datos" (fechas, precios,
enlaces) o si además han reescrito el contenido de algún día entero.

## 2. Regenerar el catalán (`db.json`)

```
python scripts/extract_excel.py "excel_nuevo.xlsx" "src/data/db.json"
```

Esto ya incluye:
- Un `id` estable por reserva basado en el concepto (no en la fila), para
  que las ediciones de admin en Supabase no se desincronicen si alguien
  reordena filas en el Excel.
- Los campos de check-in/check-out (columnas H/I de RESERVES) si existen.

## 3. Reconciliar las traducciones (en/es/ja)

Esto NO traduce nada nuevo automáticamente — solo evita que las
traducciones existentes se queden corruptas o desalineadas. Necesita el
catalán **anterior** (antes del cambio) para saber qué es idéntico y qué
ha cambiado de verdad:

```
python scripts/extract_excel.py "excel_viejo.xlsx" ruta_temporal.json
node scripts/sync_translations.mjs ruta_temporal.json
```

Al terminar, te lista qué días y qué reservas nuevas se han quedado en
catalán por falta de traducción (todo lo que no cambió mantiene su
traducción de siempre, intacta).

## 4. Traducir lo pendiente (opcional, solo si quieres)

Si la lista de días/reservas pendientes es corta, se puede pedir traducir
solo esos días/reservas concretos (no hace falta retraducir todo el
itinerario). Si prefieres dejarlo en catalán de momento, la app funciona
igual, solo que esos días se ven en catalán en los otros 3 idiomas hasta
que se traduzcan.

## 5. Compilar, probar y desplegar

```
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Si algo falla, mejor pararse aquí antes de comitear. Si todo va bien:
commit + push (el deploy de GitHub Pages se dispara solo).
