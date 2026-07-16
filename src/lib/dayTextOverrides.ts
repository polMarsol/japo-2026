import { useEffect, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseReady, syncEnabled } from "./supabase";

const TABLE = "day_text_overrides";

interface Row {
  id: string;
  overrides: Record<string, string> | null;
}

export function useDayTextOverrides(day: string, lang: string) {
  const id = `${day}_${lang}`;
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    setOverrides({});
    let cancelled = false;
    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;

    getSupabaseReady().then(async (c) => {
      if (cancelled || !c) return;
      client = c;
      const { data } = await c.from(TABLE).select("*").eq("id", id).maybeSingle();
      if (!cancelled) setOverrides((data as Row | null)?.overrides ?? {});

      channel = c
        .channel(`day_text_overrides:${id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: TABLE, filter: `id=eq.${id}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setOverrides({});
            } else {
              setOverrides((payload.new as Row).overrides ?? {});
            }
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (client && channel) client.removeChannel(channel);
    };
  }, [id]);

  // Postgrest no soporta merge parcial de jsonb desde el cliente: se lee,
  // se fusiona en memoria y se reescribe la columna entera. Con un unico
  // admin editando esto no da problemas de condicion de carrera reales.
  async function setOverride(path: string, text: string) {
    const client = await getSupabaseReady();
    if (!client) return;
    const { data } = await client.from(TABLE).select("overrides").eq("id", id).maybeSingle();
    const next = { ...((data as Row | null)?.overrides ?? {}), [path]: text };
    await client.from(TABLE).upsert({ id, overrides: next });
  }

  async function clearOverride(path: string) {
    const client = await getSupabaseReady();
    if (!client) return;
    const { data } = await client.from(TABLE).select("overrides").eq("id", id).maybeSingle();
    const next = { ...((data as Row | null)?.overrides ?? {}) };
    delete next[path];
    await client.from(TABLE).upsert({ id, overrides: next });
  }

  return { overrides, setOverride, clearOverride };
}
