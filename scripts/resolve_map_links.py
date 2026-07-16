"""
Resuelve los enlaces cortos de Google Maps (maps.app.goo.gl / goo.gl/maps)
que aparecen en db.json siguiendo las redirecciones, y extrae las
coordenadas (lat, lng) del destino final. Requiere conexion a internet -
se ejecuta una sola vez en fase de preparacion, antes del viaje.

Genera src/data/coords_cache.json: { "<link original>": [lat, lng], ... }
que el frontend fusiona con los enlaces del itinerario para poder pintar
marcadores reales en el mapa offline.

Uso:
    python scripts/resolve_map_links.py
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

COORDS_RE = re.compile(r"@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)")
QUERY_COORDS_RE = re.compile(r"[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)")
SHORT_LINK_RE = re.compile(r"goo\.gl/maps|maps\.app\.goo\.gl")
MAPS_LINK_RE = re.compile(r"google\.[a-z.]+/maps|goo\.gl/maps|maps\.app\.goo\.gl")

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; JapoTripPlanner/1.0)"}


def collect_links(obj, out: set[str]):
    if isinstance(obj, dict):
        link = obj.get("link")
        if isinstance(link, str) and MAPS_LINK_RE.search(link):
            out.add(link)
        for v in obj.values():
            collect_links(v, out)
    elif isinstance(obj, list):
        for v in obj:
            collect_links(v, out)


def resolve(link: str) -> tuple[float, float] | None:
    m = COORDS_RE.search(link) or QUERY_COORDS_RE.search(link)
    if m:
        return float(m.group(1)), float(m.group(2))

    if not SHORT_LINK_RE.search(link):
        return None

    try:
        req = urllib.request.Request(link, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            final_url = resp.geturl()
            body = resp.read(4000).decode("utf-8", errors="ignore")
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"  ! error resolviendo {link}: {e}")
        return None

    m = COORDS_RE.search(final_url) or QUERY_COORDS_RE.search(final_url)
    if m:
        return float(m.group(1)), float(m.group(2))

    m = COORDS_RE.search(body) or QUERY_COORDS_RE.search(body)
    if m:
        return float(m.group(1)), float(m.group(2))

    return None


def main():
    project_root = Path(__file__).resolve().parent.parent
    db_path = project_root / "src" / "data" / "db.json"
    cache_path = project_root / "src" / "data" / "coords_cache.json"

    if not db_path.exists():
        print("No existe src/data/db.json. Ejecuta antes extract_excel.py")
        sys.exit(1)

    db = json.loads(db_path.read_text(encoding="utf-8"))

    links: set[str] = set()
    collect_links(db, links)

    existing: dict[str, list[float]] = {}
    if cache_path.exists():
        existing = json.loads(cache_path.read_text(encoding="utf-8"))

    print(f"Enlaces de mapa encontrados: {len(links)}")
    resolved = dict(existing)
    new_count = 0

    for i, link in enumerate(sorted(links), 1):
        if link in existing:
            continue
        coords = resolve(link)
        status = coords if coords else "sin coordenadas"
        print(f"[{i}/{len(links)}] {link} -> {status}")
        if coords:
            resolved[link] = list(coords)
            new_count += 1
        time.sleep(0.3)

    cache_path.write_text(
        json.dumps(resolved, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"OK -> {cache_path}  ({new_count} nuevas, {len(resolved)} en total)")


if __name__ == "__main__":
    main()
