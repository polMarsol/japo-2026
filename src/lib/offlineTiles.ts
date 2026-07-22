// Descarga deliberada de tiles del mapa a la cache "osm-tiles" (el mismo
// nombre que usa el runtimeCaching de vite-plugin-pwa en vite.config.ts),
// para garantizar que un dia concreto quede disponible offline en vez de
// depender de que el usuario haya hecho scroll por esa zona antes.

const TILE_CACHE_NAME = "osm-tiles";
const SUBDOMAINS = ["a", "b", "c"];
const ZOOM_LEVELS = [13, 14, 15, 16];
const PADDING_DEG = 0.03; // ~3km de margen alrededor de los pines del dia

function tileUrl(z: number, x: number, y: number): string {
  const sub = SUBDOMAINS[(x + y) % SUBDOMAINS.length];
  return `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

function lngLatToTile(lat: number, lng: number, z: number): [number, number] {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return [x, y];
}

export interface Tile {
  z: number;
  x: number;
  y: number;
}

export function tilesForCoords(coordsList: [number, number][]): Tile[] {
  if (coordsList.length === 0) return [];
  const lats = coordsList.map((c) => c[0]);
  const lngs = coordsList.map((c) => c[1]);
  const minLat = Math.min(...lats) - PADDING_DEG;
  const maxLat = Math.max(...lats) + PADDING_DEG;
  const minLng = Math.min(...lngs) - PADDING_DEG;
  const maxLng = Math.max(...lngs) + PADDING_DEG;

  const tiles: Tile[] = [];
  for (const z of ZOOM_LEVELS) {
    const [minX, minY] = lngLatToTile(maxLat, minLng, z);
    const [maxX, maxY] = lngLatToTile(minLat, maxLng, z);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

export async function downloadTiles(
  tiles: Tile[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (!("caches" in window)) return;
  const cache = await caches.open(TILE_CACHE_NAME);
  for (let i = 0; i < tiles.length; i++) {
    const { z, x, y } = tiles[i];
    const url = tileUrl(z, x, y);
    try {
      const existing = await cache.match(url);
      if (!existing) {
        const response = await fetch(url, { mode: "no-cors" });
        await cache.put(url, response);
      }
    } catch {
      // Un tile individual puede fallar (red, rate limit); seguimos con el resto.
    }
    onProgress?.(i + 1, tiles.length);
  }
}
