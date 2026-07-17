import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";
import type { ExpenseCategory } from "./expenseCategories";
import type { Currency } from "./expensesSync";
import type { Share, SplitMethod } from "./debtSimplify";

export interface JipiwiseExpenseRow {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  split_method: SplitMethod;
  payers: Share[];
  shares: Share[];
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface JipiwiseExpenseInput {
  description: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  split_method: SplitMethod;
  payers: Share[];
  shares: Share[];
  receipt_url: string | null;
  notes: string | null;
}

export interface SettlementRow {
  id: string;
  from_person: string;
  to_person: string;
  amount_eur: number;
  created_at: string;
}

const EXPENSES_TABLE = "jipiwise_expenses";
const SETTLEMENTS_TABLE = "jipiwise_settlements";

export function useJipiwiseExpenses() {
  const [rows, setRows] = useState<Record<string, JipiwiseExpenseRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<JipiwiseExpenseRow>(client, EXPENSES_TABLE, "id", setRows);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const list = Object.values(rows).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  async function addExpense(data: JipiwiseExpenseInput) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(EXPENSES_TABLE).insert(data);
  }

  async function updateExpense(id: string, patch: Partial<JipiwiseExpenseInput>) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(EXPENSES_TABLE).update(patch).eq("id", id);
  }

  async function deleteExpense(id: string) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(EXPENSES_TABLE).delete().eq("id", id);
  }

  return { expenses: list, addExpense, updateExpense, deleteExpense };
}

export function useSettlements() {
  const [rows, setRows] = useState<Record<string, SettlementRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<SettlementRow>(client, SETTLEMENTS_TABLE, "id", setRows);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const list = Object.values(rows).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  async function addSettlement(fromPerson: string, toPerson: string, amountEur: number) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client
      .from(SETTLEMENTS_TABLE)
      .insert({ from_person: fromPerson, to_person: toPerson, amount_eur: amountEur });
  }

  async function deleteSettlement(id: string) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(SETTLEMENTS_TABLE).delete().eq("id", id);
  }

  return { settlements: list, addSettlement, deleteSettlement };
}

/** Sube la foto de un recibo al bucket publico "receipts" y devuelve su URL
 * publica. Es solo referencia visual: no hay lectura automatica de importes. */
export async function uploadReceipt(file: File): Promise<string | null> {
  const client = await getSupabaseReady();
  if (!client) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage.from("receipts").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return null;
  const { data } = client.storage.from("receipts").getPublicUrl(path);
  return data.publicUrl;
}
