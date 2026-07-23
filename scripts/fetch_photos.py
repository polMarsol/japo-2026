"""
Descarga fotos reales (licencia libre) de Wikipedia/Wikimedia Commons para
los lugares destacados de src/data/enrichment.ts, con atribucion correcta.
Requiere conexion a internet - se ejecuta una vez en fase de preparacion.

Para cada lugar prueba una lista de titulos candidatos de Wikipedia (en
ingles), coge la imagen principal del articulo, resuelve el fichero en
Commons para sacar autor/licencia, y descarga la imagen a
public/images/places/<slug>.jpg.

Genera src/data/photos.json:
  { "<nombre del lugar>": { "file": "images/places/x.jpg",
                             "credit": "Autor", "license": "CC BY-SA 4.0",
                             "sourceTitle": "Titulo en Wikipedia" } }

Uso:
    python scripts/fetch_photos.py
"""

from __future__ import annotations

import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

MAX_WIDTH = 900
JPEG_QUALITY = 78

HEADERS = {
    "User-Agent": "JapoTripPlanner/1.0 (personal travel PWA, non-commercial)"
}

# lugar (debe coincidir EXACTO con "place" en enrichment.ts) -> candidatos de
# titulo de articulo de Wikipedia (en), en orden de preferencia.
PLACES: dict[str, list[str]] = {
    "__vehicle__": ["Honda Step WGN"],
    "Sakurai Futamigaura (Meoto Iwa)": ["Meoto Iwa"],
    "Tōchō-ji": ["Tōchō-ji"],
    "Gorja de Takachiho": ["Takachiho Gorge", "Takachiho, Miyazaki"],
    "Amano Iwato Jinja": ["Amano Iwato", "Amaterasu"],
    "Yokagura (dansa nocturna)": ["Takachiho, Miyazaki"],
    "Kerama Shotō (illes Kerama)": ["Kerama Islands"],
    "Karate d'Okinawa": ["Karate"],
    "Castell de Shuri": ["Shuri Castle"],
    "Parc Memorial de la Pau": ["Hiroshima Peace Memorial Park"],
    "Torii flotant de Miyajima (Itsukushima)": ["Itsukushima Shrine"],
    "Dōgo Onsen": ["Dōgo Onsen"],
    "Okayama": ["Okayama Castle"],
    "Kurashiki Bikan": ["Kurashiki Bikan Historical Area", "Kurashiki"],
    "Dōtonbori": ["Dōtonbori"],
    "Kōyasan": ["Kōyasan"],
    "Cascada de Nachi i Kumano Kodo": ["Nachi Falls"],
    "Toba i les ama": ["Ama (diving)"],
    "Gion": ["Gion, Kyoto"],
    "Fushimi Inari Taisha": ["Fushimi Inari-taisha"],
    "Kiyomizu-dera": ["Kiyomizu-dera"],
    "Bosc de bambú d'Arashiyama": ["Arashiyama", "Sagano Bamboo Forest"],
    "Kinkaku-ji (Pavelló Daurat)": ["Kinkaku-ji"],
    "Gozan no Okuribi (Daimonji)": ["Gozan no Okuribi"],
    "Sanmachi Suji": ["Takayama, Gifu"],
    "Nakasendō: Magome–Tsumago": ["Magome-juku"],
    "Mont Takao": ["Mount Takao"],
    "Senso-ji (Asakusa)": ["Sensō-ji"],
    "Shibuya Crossing": ["Shibuya Crossing"],
    "Mercat de Toyosu": ["Toyosu Market"],
    "Naha (Kokusai-dori)": ["Naha"],
    "Kansai International Airport": ["Kansai International Airport"],
    "teamLab Planets": ["teamLab Planets", "teamLab Borderless", "teamLab"],
}

TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(html: str) -> str:
    return TAG_RE.sub("", html).strip()


def fetch_with_retry(req: urllib.request.Request, tries: int = 4, timeout: int = 15):
    delay = 2.0
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < tries - 1:
                print(f"    (429, esperando {delay:.0f}s...)")
                time.sleep(delay)
                delay *= 2
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt < tries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
    return None


def wiki_summary(title: str) -> dict | None:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        body = fetch_with_retry(req)
        return json.loads(body.decode("utf-8")) if body else None
    except (urllib.error.URLError, TimeoutError):
        return None


def commons_file_info(image_url: str) -> dict:
    filename = urllib.parse.unquote(image_url.rsplit("/", 1)[-1])
    filename = re.sub(r"^\d+px-", "", filename)  # los thumbs anteponen "NNNpx-"
    api = (
        "https://commons.wikimedia.org/w/api.php?action=query&titles="
        + urllib.parse.quote(f"File:{filename}")
        + "&prop=imageinfo&iiprop=extmetadata&format=json"
    )
    req = urllib.request.Request(api, headers=HEADERS)
    try:
        body = fetch_with_retry(req)
        data = json.loads(body.decode("utf-8")) if body else {}
    except (urllib.error.URLError, TimeoutError):
        return {}

    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        meta = page.get("imageinfo", [{}])[0].get("extmetadata", {})
        artist = strip_tags(meta.get("Artist", {}).get("value", ""))
        license_short = meta.get("LicenseShortName", {}).get("value", "")
        return {"credit": artist, "license": license_short}
    return {}


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def download_optimized(url: str, dest: Path):
    """Descarga y reescala/recomprime a JPEG para que el precache de la PWA
    no cargue con imagenes de varios MB (algunos 'thumbnails' de Wikipedia
    resultan sorprendentemente grandes)."""
    req = urllib.request.Request(url, headers=HEADERS)
    body = fetch_with_retry(req, timeout=25)
    if not body:
        return
    img = Image.open(io.BytesIO(body))
    img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, round(img.height * ratio)), Image.LANCZOS)
    img.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)


def main():
    project_root = Path(__file__).resolve().parent.parent
    images_dir = project_root / "public" / "images" / "places"
    images_dir.mkdir(parents=True, exist_ok=True)
    out_path = project_root / "src" / "data" / "photos.json"

    result: dict[str, dict] = {}
    if out_path.exists():
        result = json.loads(out_path.read_text(encoding="utf-8"))

    for place, candidates in PLACES.items():
        if place in result:
            print(f"skip (ya existe): {place}")
            continue

        found = False
        for title in candidates:
            summary = wiki_summary(title)
            if not summary:
                continue
            image = summary.get("thumbnail") or summary.get("originalimage")
            if not image or not image.get("source"):
                continue
            # Wikimedia solo permite un conjunto fijo de anchos de thumbnail;
            # el que trae el resumen por defecto siempre es valido, asi que
            # no lo tocamos (evita 400 "Use thumbnail sizes").
            download_url = image["source"]

            slug = slugify(place)
            dest = images_dir / f"{slug}.jpg"

            try:
                download_optimized(download_url, dest)
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                print(f"  ! error descargando {title}: {e}")
                time.sleep(6)
                continue

            # Para la atribucion consultamos el fichero original en Commons,
            # no el thumbnail (el nombre base del fichero es el mismo).
            info = commons_file_info(image.get("source", download_url))
            result[place] = {
                "file": f"images/places/{slug}.jpg",
                "credit": info.get("credit", ""),
                "license": info.get("license", ""),
                "sourceTitle": title,
            }
            print(f"OK  {place} <- {title} ({dest.name})")
            found = True
            time.sleep(3.5)
            break

        if not found:
            print(f"SIN IMAGEN: {place}")

    out_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n{len(result)}/{len(PLACES)} lugares con foto -> {out_path}")


if __name__ == "__main__":
    main()
