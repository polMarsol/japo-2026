"""
Aplica los cambios de updates/errors  app viatge.xlsx: anade rutas de
Google Maps que faltaban entre paradas consecutivas de varios dias, y
corrige un enlace equivocado en el dia 14 (oficina de ORIX equivocada).

Cada dia afectado recibe una nueva seccion "Actualitzacions de ruta" al
final de sus sections, con un nodo por cada tramo (texto "Origen -> Desti"
+ link) o nota informativa (sin link). Se aplica igual a los 4 idiomas
(db.json, db.en.json, db.es.json, db.ja.json) para no romper el mecanismo
de sync_translations.mjs con dias que hayan cambiado en un idioma y no en
otro.

Uso:
    python scripts/apply_route_errors.py
"""

from __future__ import annotations

import json
from pathlib import Path

SECTION_TITLE = {
    "ca": "Actualitzacions de ruta",
    "en": "Route updates",
    "es": "Actualizaciones de ruta",
    "ja": "ルートの更新",
}

# (from, to, link) para rutas; (None, None, link=None, note=texto) para notas.
NEW_ROUTES: dict[str, list[dict]] = {
    "1": [
        {"from": "Fukuoka Airport", "to": "Nissan Rent-a-car (Higashihie)",
         "link": "https://maps.app.goo.gl/v2RM5zAMvbLS9hmv8"},
        {"from": "Sakurai Futamigaura", "to": "TRIGON Hotel",
         "link": "https://maps.app.goo.gl/GppiWSyrDdRiYdFi8"},
        {"from": "TRIGON Hotel", "to": "Sakurai Futamigaura",
         "link": "https://maps.app.goo.gl/MTreenxedYeX24wi9"},
    ],
    "2": [
        {"from": "TRIGON Hotel", "to": "Tochoji Temple",
         "link": "https://maps.app.goo.gl/nGYRRi19AaiWXVJR6"},
        {"from": "Tochoji Temple", "to": "Oshiromae Parking Lot (Kumamoto Castle)",
         "link": "https://maps.app.goo.gl/r4u2bcrU3MqMgQ75A"},
        {"from": "Oshiromae Parking Lot", "to": "Reigando Cave",
         "link": "https://maps.app.goo.gl/MgNVKUfijuiMRHVW7"},
        {"from": "Reigando Cave", "to": "Kamishikimi Kumanoza Shrine",
         "link": "https://maps.app.goo.gl/BZoFMN5hd8jZ4Gbr8"},
        {"from": "Kamishikimi Kumanoza Shrine", "to": "Alberg Takachiho Sanso Amaterasu Kagura",
         "link": "https://maps.app.goo.gl/HwyScGQq1Yub696P7"},
    ],
    "3": [
        {"from": "Alberg Takachiho Sanso", "to": "Takachiho Gorge",
         "link": "https://maps.app.goo.gl/4N4ZCiNjRrbg5RpKA"},
        {"from": "Takachiho Gorge", "to": "Takachiho Shrine",
         "link": "https://maps.app.goo.gl/5DURwrAjZagToyJa7"},
        {"from": "Takachiho Shrine", "to": "Ama-no-Iwato Shrine (West Main Shrine)",
         "link": "https://maps.app.goo.gl/X4A6QmvTTLQuZNfY8"},
        {"note": {
            "ca": "Arrossars d'Odonokuchi: no s'ha trobat l'adreca exacta; probablement es torna per la carretera que porta a l'alberg.",
            "en": "Odonokuchi rice paddies: exact address not found; likely reached back via the road to the hostel.",
            "es": "Arrozales de Odonokuchi: no se ha encontrado la direccion exacta; probablemente se vuelve por la carretera que lleva al albergue.",
            "ja": "小野口の棚田：正確な住所が見つかりません。宿へ向かう道を戻る形になると思われます。",
        }},
        {"from": "Ama-no-Iwato Shrine (arrossars Odonokuchi)", "to": "Alberg Takachiho Sanso",
         "link": "https://maps.app.goo.gl/k7zuePQGdrcQXttCA"},
    ],
    "4": [
        {"from": "Alberg Takachiho Sanso", "to": "Kumamoto Airport",
         "link": "https://maps.app.goo.gl/xXPc852d7yRZdeKD8"},
        {"from": "Kumamoto Airport", "to": "Lloguer cotxe (1802-2 Oyatsu)",
         "link": "https://maps.app.goo.gl/MhfFPPa9a6Gv74Gg8"},
        {"from": "Naha Airport", "to": "Condominium Hotel Riyuka in Kume",
         "link": "https://maps.app.goo.gl/BZN2pG6dgRgYoZ1J8"},
    ],
    "12": [
        {"from": "Osaka Station", "to": "Lloguer de cotxe",
         "link": "https://maps.app.goo.gl/Nig4LAfuwtA5awbP9"},
        {"note": {
            "ca": "Pep i Susana dormen al temple (Koyasan Shukubo Sainanin-in).",
            "en": "Pep and Susana sleep at the temple (Koyasan Shukubo Sainanin-in).",
            "es": "Pep y Susana duermen en el templo (Koyasan Shukubo Sainanin-in).",
            "ja": "PepとSusanaは寺（高野山宿坊 西南院）に宿泊します。",
        }},
    ],
    "13": [
        {"from": "Koyasan Shukubo Sainanin-in", "to": "Kumano Kodo - Nakahechi Daimon-zaka",
         "link": "https://maps.app.goo.gl/oKDXecrkRbiPy4jj7"},
        {"from": "Kumano Kodo - Daimon-zaka", "to": "Kumano Nachi Taisha",
         "link": "https://maps.app.goo.gl/FkeJL3BxLtLxnB5HA"},
        {"from": "Kumano Nachi Taisha", "to": "Seiganto-ji",
         "link": "https://maps.app.goo.gl/AS44dk4SBEdjwaGi7"},
        {"from": "Seiganto-ji", "to": "Cascada de Nachi",
         "link": "https://maps.app.goo.gl/vD7EiC8SGhzBHFCRA"},
        {"from": "Cascada de Nachi", "to": "Hotel Wisterian Life Club Toba",
         "link": "https://maps.app.goo.gl/4RGyeq7oL7PWn5Pa7"},
    ],
    "14": [
        {"from": "Hotel Wisterian Life Club Toba", "to": "ORIX Rent-a-car Kyoto-ekimae Shinkansen-guchi",
         "link": "https://maps.app.goo.gl/VTdefwWLzM1nGAq29"},
        {"from": "ORIX Rent-a-car Kyoto-ekimae Shinkansen-guchi", "to": "UU Inn Kyoto",
         "link": "https://maps.app.goo.gl/WaBWmkgjVEvTcgGo9"},
    ],
    "17": [
        {"from": "UU Inn Kyoto", "to": "Toyota Rent-a-car (Kyoto Shinkansen-guchi)",
         "link": "https://maps.app.goo.gl/xj6tyMvuxFFHwYTw9"},
        {"from": "Lloguer de cotxe", "to": "Mina's LanternHouse (Takayama)",
         "link": "https://maps.app.goo.gl/AUDxToq18rmcwfUH6"},
        {"from": "Mina's LanternHouse", "to": "Sanmachi Suji (Takayama)",
         "link": "https://maps.app.goo.gl/yQ9t4rxRJFURhigt5"},
    ],
    "18": [
        {"from": "Mina's LanternHouse (Takayama)", "to": "AB Hotel Nakatsugawa",
         "link": "https://maps.app.goo.gl/wKzmvwwvKWRVnLg38"},
        {"from": "AB Hotel Nakatsugawa", "to": "Tsumago-juku",
         "link": "https://maps.app.goo.gl/acGdHaZo43D3uc4TA"},
        {"from": "Tsumago-juku", "to": "AB Hotel Nakatsugawa",
         "link": "https://maps.app.goo.gl/JFGf9Q4ESocpsrCR6"},
    ],
    "19": [
        {"from": "AB Hotel Nakatsugawa", "to": "Llac Kawaguchi (opcio si hi ha bona visibilitat)",
         "link": "https://maps.app.goo.gl/2cHrApV5zPpbMaqc9"},
        {"from": "Mount Takao", "to": "Toyota Rent-a-car Hachioji Ekimae",
         "link": "https://maps.app.goo.gl/k2AjzTeLQ852u8X5A"},
        {"from": "Toyota Rent-a-car Hachioji Ekimae", "to": "Hotel Hana Asakusa 2 (Tokyo)",
         "link": "https://maps.app.goo.gl/cHBWBb7WFKGVYtqc8"},
    ],
}

# Fix del dia 1: el node "Ruta" existente sota Allotjament es refresca amb
# l'enllac mes recent (mateix trajecte Nissan Rent-a-car -> TRIGON Hotel).
DAY1_ROUTE_FIX_OLD = "https://www.google.es/maps/dir/Nissan+Rent-a-car,+3+Chome-11-18+Higashihie,+Hakata+Ward,+Fukuoka,+812-0007,+Jap%C3%B3n/TRIGON+HOTEL,+Jap%C3%B3n,+%E3%80%92812-0018+Fukuoka,+Hakata+Ward,+Sumiyoshi,+4+Chome%E2%88%9222%E2%88%927/@33.5805776,130.4116888,1252m/"
DAY1_ROUTE_FIX_NEW = "https://maps.app.goo.gl/4PeuqAHYkeCgUUhd8"

# Fix del dia 14: el node "Cotxe de lloguer" (Transport) apuntava a l'oficina
# ORIX equivocada (Kyoto Minami); es correcte es la de Kyoto-ekimae.
DAY14_RENTAL_FIX_OLD = "https://maps.app.goo.gl/3xNyzA5RNF5AjVjs7"
DAY14_RENTAL_FIX_NEW = "https://www.google.com/maps/place/ORIX+Rent-a-car+Kyoto-ekimae+Shinkansen-guchi/@34.9840504,135.7535764,435m/data=!3m1!1e3!4m14!1m7!3m6!1s0x600108a972d65c63:0x37490c88da64cc89!2sORIX+Rent-a-car+Kyoto-ekimae+Shinkansen-guchi!8m2!3d34.9839647!4d135.7548746!16s%2Fg%2F1tdm_dd5!3m5!1s0x600108a972d65c63:0x37490c88da64cc89!8m2!3d34.9839647!4d135.7548746!16s%2Fg%2F1tdm_dd5?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D"


def apply_fix(nodes: list[dict], old_link: str, new_link: str) -> bool:
    for node in nodes:
        if node.get("link") == old_link:
            node["link"] = new_link
            return True
        if node.get("children") and apply_fix(node["children"], old_link, new_link):
            return True
    return False


def build_section(lang: str, entries: list[dict]) -> dict:
    children = []
    for entry in entries:
        if "note" in entry:
            children.append({"text": entry["note"][lang], "children": []})
        else:
            children.append({
                "text": f"{entry['from']} → {entry['to']}",
                "link": entry["link"],
                "children": [],
            })
    return {"text": SECTION_TITLE[lang], "children": children}


def process_file(path: Path, lang: str) -> None:
    if not path.exists():
        print(f"  (no existe {path.name}, se omite)")
        return
    db = json.loads(path.read_text(encoding="utf-8"))

    for day, entries in NEW_ROUTES.items():
        outline = db["days"].get(day)
        if not outline:
            print(f"  ! dia {day} no existe en {path.name}")
            continue
        # Evita duplicar si el script se relanza.
        if any(s.get("text") == SECTION_TITLE[lang] for s in outline["sections"]):
            print(f"  dia {day}: seccion ya presente, se omite")
            continue
        outline["sections"].append(build_section(lang, entries))
        print(f"  dia {day}: +{len(entries)} entradas")

    fixed1 = apply_fix(
        [n for outline in db["days"].values() for n in outline["sections"]],
        DAY1_ROUTE_FIX_OLD, DAY1_ROUTE_FIX_NEW,
    )
    print(f"  fix dia 1 (ruta hotel): {'OK' if fixed1 else 'NO ENCONTRADO'}")
    fixed14 = apply_fix(
        [n for outline in db["days"].values() for n in outline["sections"]],
        DAY14_RENTAL_FIX_OLD, DAY14_RENTAL_FIX_NEW,
    )
    print(f"  fix dia 14 (lloguer cotxe): {'OK' if fixed14 else 'NO ENCONTRADO'}")

    path.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  -> guardado {path.name}")


def main():
    root = Path(__file__).resolve().parent.parent / "src" / "data"
    for lang, filename in [("ca", "db.json"), ("en", "db.en.json"), ("es", "db.es.json"), ("ja", "db.ja.json")]:
        print(f"=== {filename} ===")
        process_file(root / filename, lang)


if __name__ == "__main__":
    main()
