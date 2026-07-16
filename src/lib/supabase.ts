import { supabaseConfig, supabaseConfigured } from "./supabaseConfig";
import type { SupabaseClient } from "@supabase/supabase-js";

// El SDK de Supabase se carga en un chunk aparte via import() perezoso
// (nunca bloquea el primer render offline-first) y solo si hay config real.
export const syncEnabled = supabaseConfigured;

let readyPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabaseReady(): Promise<SupabaseClient | null> {
  if (!syncEnabled) return Promise.resolve(null);
  if (!readyPromise) {
    readyPromise = import("@supabase/supabase-js").then(async ({ createClient }) => {
      const client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
      // Auth anonima: no da seguridad real (cualquiera puede pedirla), pero
      // evita que un script cualquiera pegue directo al REST endpoint sin
      // pasar por el SDK. Las policies RLS exigen auth.uid() no nulo.
      const { data } = await client.auth.getSession();
      if (!data.session) {
        await client.auth.signInAnonymously();
      }
      return client;
    });
  }
  return readyPromise;
}

/** Suscripcion generica a una tabla: carga inicial + realtime, fusionando
 * los cambios en un mapa id -> fila. Se reusa en los tres hooks de sync. */
export function subscribeTable<T>(
  client: SupabaseClient,
  table: string,
  idKey: string,
  onUpdate: (rows: Record<string, T>) => void,
): () => void {
  let rows: Record<string, T> = {};
  let cancelled = false;
  const keyOf = (r: T) => String((r as Record<string, unknown>)[idKey]);

  client
    .from(table)
    .select("*")
    .then(({ data }) => {
      if (cancelled || !data) return;
      rows = Object.fromEntries((data as T[]).map((r) => [keyOf(r), r]));
      onUpdate({ ...rows });
    });

  const channel = client
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        if (payload.eventType === "DELETE") {
          delete rows[keyOf(payload.old as T)];
        } else {
          const row = payload.new as T;
          rows[keyOf(row)] = row;
        }
        onUpdate({ ...rows });
      },
    )
    .subscribe();

  return () => {
    cancelled = true;
    client.removeChannel(channel);
  };
}
