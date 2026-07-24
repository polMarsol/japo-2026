import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";

export interface MedicalInfoRow {
  person: string; // id
  blood_type: string;
  allergies: string;
  updated_at: string;
}

const MEDICAL_TABLE = "medical_info";

/** Fitxa mèdica bàsica per viatger (grup sanguini + al·lèrgies), visible i
 * editable per tothom — mateix patró que packingSync.ts (una fila per persona,
 * upsert per desar). */
export function useMedicalInfo() {
  const [rows, setRows] = useState<Record<string, MedicalInfoRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<MedicalInfoRow>(client, MEDICAL_TABLE, "person", setRows);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  async function setMedicalInfo(person: string, bloodType: string, allergies: string): Promise<boolean> {
    const client = await getSupabaseReady();
    if (!client) return false;
    const { error } = await client.from(MEDICAL_TABLE).upsert({
      person,
      blood_type: bloodType,
      allergies,
      updated_at: new Date().toISOString(),
    });
    return !error;
  }

  return { rows, setMedicalInfo };
}
