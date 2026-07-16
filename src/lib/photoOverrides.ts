import { useEffect, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseReady, syncEnabled } from "./supabase";
import { getPlacePhoto, type PlacePhoto } from "./photos";

const TABLE = "photo_overrides";

interface Row {
  place: string;
  file: string;
  credit: string | null;
  license: string | null;
  source_title: string | null;
}

function toPhoto(row: Row): PlacePhoto {
  return {
    file: row.file,
    credit: row.credit ?? "",
    license: row.license ?? "",
    sourceTitle: row.source_title ?? "",
  };
}

export function usePlacePhoto(place: string) {
  const staticPhoto = getPlacePhoto(place);
  const [override, setOverrideState] = useState<PlacePhoto | null>(null);

  useEffect(() => {
    if (!syncEnabled) return;
    setOverrideState(null);
    let cancelled = false;
    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;

    getSupabaseReady().then(async (c) => {
      if (cancelled || !c) return;
      client = c;
      const { data } = await c.from(TABLE).select("*").eq("place", place).maybeSingle();
      if (!cancelled) setOverrideState(data ? toPhoto(data as Row) : null);

      channel = c
        .channel(`photo_overrides:${place}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: TABLE, filter: `place=eq.${place}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setOverrideState(null);
            } else {
              setOverrideState(toPhoto(payload.new as Row));
            }
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (client && channel) client.removeChannel(channel);
    };
  }, [place]);

  async function setOverride(url: string, credit: string) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client
      .from(TABLE)
      .upsert({ place, file: url, credit, license: "", source_title: place });
  }

  async function clearOverride() {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(TABLE).delete().eq("place", place);
  }

  return {
    photo: override ?? staticPhoto,
    isOverride: Boolean(override),
    setOverride,
    clearOverride,
  };
}
