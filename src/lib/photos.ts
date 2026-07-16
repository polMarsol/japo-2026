import raw from "../data/photos.json";
import { getHighlights } from "../data/enrichment";

export interface PlacePhoto {
  file: string;
  credit: string;
  license: string;
  sourceTitle: string;
}

const PHOTOS = raw as Record<string, PlacePhoto>;

export function getPlacePhoto(place: string): PlacePhoto | undefined {
  return PHOTOS[place];
}

export function photoUrl(photo: PlacePhoto): string {
  if (/^https?:\/\//.test(photo.file)) return photo.file;
  return `${import.meta.env.BASE_URL}${photo.file}`;
}

export function getDayHeroPhoto(lang: string, day: string): PlacePhoto | undefined {
  const highlights = getHighlights(lang, day);
  for (const h of highlights ?? []) {
    const photo = getPlacePhoto(h.place);
    if (photo) return photo;
  }
  return undefined;
}
