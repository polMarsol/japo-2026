import { useEffect, useState } from "react";
import { getSupabaseReady, subscribeTable, syncEnabled } from "./supabase";
import type { ExpenseCategory } from "./expenseCategories";

export type Currency = "EUR" | "JPY";

export interface ExpenseRow {
  id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  payer: string;
  notes: string | null;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  payer: string;
  notes: string | null;
}

const EXPENSES_TABLE = "expenses";
const POOL_TABLE = "expense_pool";
const POOL_ID = "main";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Record<string, ExpenseRow>>({});

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<ExpenseRow>(client, EXPENSES_TABLE, "id", setExpenses);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const list = Object.values(expenses).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  async function addExpense(data: ExpenseInput) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(EXPENSES_TABLE).insert(data);
  }

  async function updateExpense(id: string, patch: Partial<ExpenseInput>) {
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

export function useExpensePool() {
  const [total, setTotalState] = useState<number>(0);

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    getSupabaseReady().then((client) => {
      if (cancelled || !client) return;
      unsub = subscribeTable<{ id: string; total: number }>(
        client,
        POOL_TABLE,
        "id",
        (rows) => setTotalState(rows[POOL_ID]?.total ?? 0),
      );
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  async function setTotal(value: number) {
    const client = await getSupabaseReady();
    if (!client) return;
    await client.from(POOL_TABLE).upsert({ id: POOL_ID, total: value });
  }

  return { total, setTotal };
}
