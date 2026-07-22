"""
Precalcula distancia, duracion y trazado (a pie y en coche) entre las
paradas consecutivas de cada dia del itinerario, usando la API gratuita
de OpenRouteService. Requiere conexion a internet y una API key gratuita
(https://openrouteservice.org/dev/#/signup) en la variable de entorno
ORS_API_KEY. Se ejecuta una sola vez en fase de preparacion, antes del
viaje (y se puede re-ejecutar sin coste: los tramos ya calculados se
reutilizan del routes.json existente).

Genera src/data/routes.json:
  { "<dia>": [ { from, to, fromCoords, toCoords,
                 foot: {distanceM, durationS, geometry} | null,
                 car: {distanceM, durationS, geometry} | null }, ... ] }

Uso:
    ORS_API_KEY=tu_api_key python scripts/precompute_routes.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

MAPS_HOST_RE = re.compile(r"google\.[a-z.]+/maps|goo\.gl/maps|maps\.app\.goo\.gl", re.I)
COORDS_RE = re.compile(r"@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)")
QUERY_COORDS_RE = re.compile(r"[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)")

ORS_PROFILES = {"foot": "foot-walking", "car": "driving-car"}
REQUEST_DELAY_S = 1.5  # cuota gratuita ORS: 40 req/min


def extract_coords(link: str, cache: dict[str, list[float]]) -> tuple[float, float] | None:
    cached = cache.get(link)
    if cached and len(cached) == 2:
        return cached[0], cached[1]
    m = COORDS_RE.search(link) or QUERY_COORDS_RE.search(link)
    if not m:
        return None
    return float(m.group(1)), float(m.group(2))


def walk(nodes, day: str, cache: dict[str, list[float]], out: dict[str, list[dict]]):
    """Misma logica que src/lib/locations.ts::walk, en Python, pero
    conservando dia + orden (para poder generar tramos consecutivos)."""
    for node in nodes:
        link = node.get("link")
        if link and MAPS_HOST_RE.search(link):
            coords = extract_coords(link, cache)
            if coords:
                out.setdefault(day, []).append({"name": node["text"], "coords": list(coords)})
        children = node.get("children") or []
        if children:
            walk(children, day, cache, out)


def ors_route(profile: str, start: tuple[float, float], end: tuple[float, float], api_key: str) -> dict | None:
    url = f"https://api.openrouteservice.org/v2/directions/{profile}/geojson"
    body = json.dumps({
        "coordinates": [[start[1], start[0]], [end[1], end[0]]],
        "geometry_simplify": True,
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
            "Accept": "application/geo+json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        print(f"    ! error {profile}: {e}")
        return None

    feature = data["features"][0]
    summary = feature["properties"]["summary"]
    geometry = [[lat, lon] for lon, lat in feature["geometry"]["coordinates"]]
    return {
        "distanceM": round(summary["distance"]),
        "durationS": round(summary["duration"]),
        "geometry": geometry,
    }


def main():
    api_key = os.environ.get("ORS_API_KEY")
    if not api_key:
        print("Falta la variable de entorno ORS_API_KEY.")
        print("Crea una key gratis en https://openrouteservice.org/dev/#/signup")
        print("y ejecuta: ORS_API_KEY=tu_key python scripts/precompute_routes.py")
        sys.exit(1)

    project_root = Path(__file__).resolve().parent.parent
    db_path = project_root / "src" / "data" / "db.json"
    coords_cache_path = project_root / "src" / "data" / "coords_cache.json"
    routes_path = project_root / "src" / "data" / "routes.json"

    if not db_path.exists():
        print("No existe src/data/db.json. Ejecuta antes extract_excel.py")
        sys.exit(1)

    db = json.loads(db_path.read_text(encoding="utf-8"))
    coords_cache: dict[str, list[float]] = (
        json.loads(coords_cache_path.read_text(encoding="utf-8")) if coords_cache_path.exists() else {}
    )

    stops_by_day: dict[str, list[dict]] = {}
    for day, outline in db["days"].items():
        walk(outline.get("sections", []), day, coords_cache, stops_by_day)

    existing: dict[str, list[dict]] = {}
    if routes_path.exists():
        existing = json.loads(routes_path.read_text(encoding="utf-8"))

    result: dict[str, list[dict]] = dict(existing)

    for day in sorted(stops_by_day, key=lambda d: int(d)):
        stops = stops_by_day[day]
        if len(stops) < 2:
            continue
        cached_legs = {(leg["from"], leg["to"]): leg for leg in existing.get(day, [])}
        legs = []
        for a, b in zip(stops, stops[1:]):
            key = (a["name"], b["name"])
            if key in cached_legs:
                legs.append(cached_legs[key])
                continue
            print(f"Dia {day}: {a['name']} -> {b['name']}")
            leg = {
                "from": a["name"],
                "to": b["name"],
                "fromCoords": a["coords"],
                "toCoords": b["coords"],
                "foot": None,
                "car": None,
            }
            for mode, profile in ORS_PROFILES.items():
                leg[mode] = ors_route(profile, tuple(a["coords"]), tuple(b["coords"]), api_key)
                time.sleep(REQUEST_DELAY_S)
            legs.append(leg)
        result[day] = legs

    routes_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK -> {routes_path}")


if __name__ == "__main__":
    main()
