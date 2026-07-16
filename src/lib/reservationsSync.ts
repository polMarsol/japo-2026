import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";
import type { ReservationItem } from "./db";

const OVERRIDES_TABLE = "reservation_overrides";
const CUSTOM_TABLE = "custom_reservations";

interface OverrideRow {
  id: string;
  concept: string | null;
  status_key: ReservationItem["statusKey"] | null;
  cost_total: number | null;
  cost_per_person: number | null;
  notes: string | null;
  link: string | null;
  deleted: boolean | null;
}

interface CustomRow {
  id: string;
  date: string | null;
  concept: string;
  link: string | null;
  status_key: ReservationItem["statusKey"];
  cost_total: number | null;
  cost_per_person: number | null;
  responsible: string | null;
  notes: string | null;
  notes_link: string | null;
}

export interface ReservationPatch {
  concept?: string;
  statusKey?: ReservationItem["statusKey"];
  costTotal?: number | null;
  costPerPerson?: number | null;
  notes?: string | null;
  link?: string | null;
  deleted?: boolean;
}

export interface SyncedReservation extends ReservationItem {
  id: string;
  custom: boolean;
}

export function useSyncedReservations(baseItems: ReservationItem[]) {
  const [overrides, setOverrides] = useState<Record<string, OverrideRow>>({});
  const [custom, setCustom] = useState<Record<string, CustomRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    const unsubs: Array<() => void> = [];

    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsubs.push(
        subscribeTable<OverrideRow>(client, OVERRIDES_TABLE, "id", setOverrides),
      );
      unsubs.push(subscribeTable<CustomRow>(client, CUSTOM_TABLE, "id", setCustom));
    });

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, []);

  const items: SyncedReservation[] = baseItems
    .map((item) => {
      const id = item.id;
      const patch = overrides[id];
      if (patch?.deleted) return null;
      return {
        ...item,
        concept: patch?.concept ?? item.concept,
        statusKey: patch?.status_key ?? item.statusKey,
        costTotal: patch?.cost_total ?? item.costTotal,
        costPerPerson: patch?.cost_per_person ?? item.costPerPerson,
        notes: patch?.notes ?? item.notes,
        link: patch?.link ?? item.link,
        id,
        custom: false,
      } as SyncedReservation;
    })
    .filter((x): x is SyncedReservation => x !== null)
    .concat(
      Object.values(custom).map((row) => ({
        date: row.date,
        concept: row.concept,
        link: row.link,
        status: null,
        statusKey: row.status_key,
        costTotal: row.cost_total,
        costPerPerson: row.cost_per_person,
        responsible: row.responsible,
        notes: row.notes,
        notesLink: row.notes_link,
        checkIn: null,
        checkInLink: null,
        checkOut: null,
        checkOutLink: null,
        id: row.id,
        custom: true,
      })),
    );

  async function updateReservation(id: string, isCustom: boolean, patch: ReservationPatch) {
    const client = await getSupabaseReady();
    if (!client) return;
    const row: Record<string, unknown> = {};
    if (patch.concept !== undefined) row.concept = patch.concept;
    if (patch.statusKey !== undefined) row.status_key = patch.statusKey;
    if (patch.costTotal !== undefined) row.cost_total = patch.costTotal;
    if (patch.costPerPerson !== undefined) row.cost_per_person = patch.costPerPerson;
    if (patch.notes !== undefined) row.notes = patch.notes;
    if (patch.link !== undefined) row.link = patch.link;
    if (patch.deleted !== undefined) row.deleted = patch.deleted;

    if (isCustom) {
      await client.from(CUSTOM_TABLE).update(row).eq("id", id);
    } else {
      await client.from(OVERRIDES_TABLE).upsert({ id, ...row });
    }
  }

  async function deleteReservation(id: string, isCustom: boolean) {
    const client = await getSupabaseReady();
    if (!client) return;
    if (isCustom) {
      await client.from(CUSTOM_TABLE).delete().eq("id", id);
    } else {
      await client.from(OVERRIDES_TABLE).upsert({ id, deleted: true });
    }
  }

  async function addReservation(
    data: Omit<
      ReservationItem,
      "statusKey" | "id" | "checkIn" | "checkInLink" | "checkOut" | "checkOutLink"
    >,
  ) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(CUSTOM_TABLE).insert({
      date: data.date,
      concept: data.concept,
      link: data.link,
      status_key: "unknown",
      cost_total: typeof data.costTotal === "number" ? data.costTotal : null,
      cost_per_person: typeof data.costPerPerson === "number" ? data.costPerPerson : null,
      responsible: data.responsible,
      notes: data.notes,
      notes_link: data.notesLink,
    });
  }

  return { items, updateReservation, deleteReservation, addReservation };
}
