import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";

export interface PackingCheckRow {
  id: string; // `${person}:${itemId}`
  person: string;
  item_id: string;
  checked_at: string;
}

const PACKING_TABLE = "packing_checks";

/** Marcar/desmarcar un item d'equipatge existeix com a fila (insert/delete)
 * en comptes d'un booleà, per no haver de pre-sembrar les 7 x 34 files. */
export function usePackingChecks() {
  const [rows, setRows] = useState<Record<string, PackingCheckRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<PackingCheckRow>(client, PACKING_TABLE, "id", setRows);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  async function setChecked(person: string, itemId: string, checked: boolean) {
    const client = await getSupabaseReady();
    if (!client) return;
    const id = `${person}:${itemId}`;
    if (checked) {
      await client.from(PACKING_TABLE).upsert({ id, person, item_id: itemId, checked_at: new Date().toISOString() });
    } else {
      await client.from(PACKING_TABLE).delete().eq("id", id);
    }
  }

  function isChecked(person: string, itemId: string): boolean {
    return Boolean(rows[`${person}:${itemId}`]);
  }

  return { rows, setChecked, isChecked };
}
