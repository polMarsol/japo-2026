import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";
import { resizeImage } from "./imageResize";

export interface TripPhotoRow {
  id: string;
  day: string;
  place: string;
  uploaded_by: string | null;
  url: string;
  created_at: string;
}

const TABLE = "trip_photos";

export function useTripPhotos() {
  const [rows, setRows] = useState<Record<string, TripPhotoRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<TripPhotoRow>(client, TABLE, "id", setRows);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const list = Object.values(rows).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { rows, list };
}

/** Redimensiona i puja una foto al bucket "trip-photos", i en desa la
 * referencia (dia + lloc + qui l'ha pujat) a la taula trip_photos. */
export async function uploadTripPhoto(
  file: File,
  day: string,
  place: string,
  uploadedBy: string,
): Promise<boolean> {
  const client = await getSupabaseReady();
  if (!client) return false;

  const resized = await resizeImage(file);
  const ext = resized.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await client.storage.from("trip-photos").upload(path, resized, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return false;

  const { data } = client.storage.from("trip-photos").getPublicUrl(path);
  const { error: insertError } = await client
    .from(TABLE)
    .insert({ day, place, uploaded_by: uploadedBy, url: data.publicUrl });

  return !insertError;
}

export async function deleteTripPhoto(id: string) {
  const client = await getSupabaseReady();
  if (!client) return;
  await client.from(TABLE).delete().eq("id", id);
}
