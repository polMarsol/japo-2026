import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth";
import { syncEnabled } from "../lib/supabase";
import { useExpensePool, useExpenses, type ExpenseInput, type ExpenseRow, type Currency } from "../lib/expensesSync";
import { EXPENSE_CATEGORIES, categoryIcon, type ExpenseCategory } from "../lib/expenseCategories";
import { TRAVELERS } from "../lib/travelers";
import { useExchangeRate, toEur, formatAmount } from "../lib/exchangeRate";
import { Icon } from "../components/Icon";

const LAST_CURRENCY_KEY = "japo2026:lastCurrency";
const DISPLAY_CURRENCY_KEY = "japo2026:displayCurrency";

function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  t,
}: {
  initial?: ExpenseInput;
  onSubmit: (data: ExpenseInput) => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [currency, setCurrency] = useState<Currency>(
    initial?.currency ?? ((localStorage.getItem(LAST_CURRENCY_KEY) as Currency) || "JPY"),
  );
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "food");
  const [payer, setPayer] = useState(initial?.payer ?? TRAVELERS[0]);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const amountNum = Number(amount.replace(",", "."));
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-accent/40 bg-accent-soft/40 p-3">
      <div className="flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={currency === "JPY" ? "0 ¥" : "0.00 €"}
          inputMode="decimal"
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-xl font-semibold text-text"
        />
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-line">
          {(["JPY", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCurrency(c);
                localStorage.setItem(LAST_CURRENCY_KEY, c);
              }}
              className={`px-3 py-2 text-sm font-semibold ${
                currency === c ? "bg-accent text-white" : "bg-surface text-muted"
              }`}
            >
              {c === "JPY" ? "¥" : "€"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium ${
              category === c.key
                ? "bg-accent text-white"
                : "bg-chip text-chip-text"
            }`}
          >
            <Icon name={c.icon} className="h-3.5 w-3.5" />
            {t(`expenses.categories.${c.key}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TRAVELERS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setPayer(name)}
            className={`rounded-full px-2.5 py-1.5 text-xs font-medium ${
              payer === name ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("expenses.notesPlaceholder")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 rounded-full bg-chip px-3 py-1.5 text-xs text-chip-text active:opacity-80"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
          {t("admin.cancel")}
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            onSubmit({ amount: amountNum, currency, category, payer, notes: notes.trim() || null })
          }
          className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs text-white active:opacity-80 disabled:opacity-40"
        >
          <Icon name="check" className="h-3.5 w-3.5" />
          {t("admin.save")}
        </button>
      </div>
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  max,
  fmt,
  icons,
}: {
  title: string;
  rows: { key: string; label: string; amount: number }[];
  max: number;
  fmt: (eur: number) => string;
  icons?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2">
            {icons && (
              <Icon name={categoryIcon(r.key)} className="h-4 w-4 shrink-0 text-accent" />
            )}
            <span className="w-20 shrink-0 truncate text-xs text-text">{r.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-chip">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${max > 0 ? (r.amount / max) * 100 : 0}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-muted">
              {fmt(r.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Expenses() {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const { total, setTotal } = useExpensePool();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { rate, fetchedAt, loading, refresh } = useExchangeRate();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPool, setEditingPool] = useState(false);
  const [poolInput, setPoolInput] = useState(String(total));
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(
    () => (localStorage.getItem(DISPLAY_CURRENCY_KEY) as Currency) || "EUR",
  );

  function fmt(amountEur: number) {
    return displayCurrency === "JPY"
      ? formatAmount(amountEur * rate, "JPY")
      : formatAmount(amountEur, "EUR");
  }

  function selectDisplayCurrency(c: Currency) {
    setDisplayCurrency(c);
    localStorage.setItem(DISPLAY_CURRENCY_KEY, c);
  }

  const spentEur = expenses.reduce(
    (sum, e) => sum + toEur(Number(e.amount), e.currency, rate),
    0,
  );
  const remaining = total - spentEur;

  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    key: c.key,
    label: t(`expenses.categories.${c.key}`),
    amount: expenses
      .filter((e) => e.category === c.key)
      .reduce((s, e) => s + toEur(Number(e.amount), e.currency, rate), 0),
  })).filter((r) => r.amount > 0);
  const maxCategory = Math.max(0, ...byCategory.map((r) => r.amount));

  const byPerson = TRAVELERS.map((name) => ({
    key: name,
    label: name,
    amount: expenses
      .filter((e) => e.payer === name)
      .reduce((s, e) => s + toEur(Number(e.amount), e.currency, rate), 0),
  })).filter((r) => r.amount > 0);
  const maxPerson = Math.max(0, ...byPerson.map((r) => r.amount));

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function editRow(item: ExpenseRow) {
    return (
      <ExpenseForm
        t={t}
        initial={{
          amount: item.amount,
          currency: item.currency,
          category: item.category,
          payer: item.payer,
          notes: item.notes,
        }}
        onCancel={() => setEditingId(null)}
        onSubmit={(data) => {
          updateExpense(item.id, data);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-text">{t("expenses.title")}</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
              <Icon name="admin_panel_settings" className="h-3.5 w-3.5" />
              {t("admin.badge")}
            </span>
          )}
          <div className="flex shrink-0 overflow-hidden rounded-full border border-line">
            {(["EUR", "JPY"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => selectDisplayCurrency(c)}
                className={`px-2.5 py-1 text-xs font-semibold ${
                  displayCurrency === c ? "bg-accent text-white" : "bg-surface text-muted"
                }`}
              >
                {c === "JPY" ? "¥" : "€"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && !syncEnabled && (
        <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-xs text-muted">
          {t("admin.syncDisabled")}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{t("expenses.remaining")}</p>
            <p
              className={`text-3xl font-semibold ${
                remaining < 0 ? "text-red-500" : "text-text"
              }`}
            >
              {fmt(remaining)}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setPoolInput(String(total));
                setEditingPool((v) => !v);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
            >
              <Icon name="edit" className="h-4 w-4" />
            </button>
          )}
        </div>

        {editingPool && (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={poolInput}
              onChange={(e) => setPoolInput(e.target.value)}
              inputMode="decimal"
              placeholder={`${t("expenses.poolAmount")} (€)`}
              className="w-full rounded-lg border border-line bg-app-bg px-2.5 py-1.5 text-sm text-text"
            />
            <button
              type="button"
              onClick={() => {
                const n = Number(poolInput.replace(",", "."));
                if (Number.isFinite(n)) setTotal(n);
                setEditingPool(false);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white active:opacity-80"
            >
              <Icon name="check" className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-6 border-t border-line pt-3">
          <div>
            <p className="text-xs text-muted">{t("expenses.pool")}</p>
            <p className="text-sm font-semibold text-text">{fmt(total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("expenses.spent")}</p>
            <p className="text-sm font-semibold text-text">{fmt(spentEur)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[11px] text-muted">
          <span>
            {t("expenses.rate")}: 1€ = {rate.toFixed(1)}¥
            {fetchedAt ? ` · ${dateFormatter.format(new Date(fetchedAt))}` : ""}
          </span>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-chip-text active:opacity-80 disabled:opacity-50"
          >
            {t("expenses.refreshRate")}
          </button>
        </div>
      </div>

      {adding ? (
        <ExpenseForm
          t={t}
          onCancel={() => setAdding(false)}
          onSubmit={(data) => {
            addExpense(data);
            setAdding(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 text-sm font-medium text-muted active:bg-chip"
        >
          <Icon name="add" className="h-4 w-4" />
          {t("expenses.addExpense")}
        </button>
      )}

      <BreakdownList
        title={t("expenses.byCategory")}
        rows={byCategory}
        max={maxCategory}
        fmt={fmt}
        icons
      />
      <BreakdownList title={t("expenses.byPerson")} rows={byPerson} max={maxPerson} fmt={fmt} />

      <ul className="flex flex-col gap-2">
        {expenses.length === 0 && (
          <li className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-8 text-muted">
            <Icon name="receipt_long" className="h-6 w-6" />
            <span className="text-sm">{t("expenses.noExpenses")}</span>
          </li>
        )}
        {expenses.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon name={categoryIcon(item.category)} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {item.payer}
                  {item.notes ? ` · ${item.notes}` : ""}
                </p>
                <p className="text-xs text-muted">
                  {dateFormatter.format(new Date(item.created_at))}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-text">
                  {formatAmount(Number(item.amount), item.currency)}
                </p>
                {item.currency !== displayCurrency && (
                  <p className="text-[11px] text-muted">
                    ≈ {fmt(toEur(Number(item.amount), item.currency, rate))}
                  </p>
                )}
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
                >
                  <Icon name="edit" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {editingId === item.id && (
              <div className="flex flex-col gap-2">
                {editRow(item)}
                <button
                  type="button"
                  onClick={() => {
                    deleteExpense(item.id);
                    setEditingId(null);
                  }}
                  className="flex items-center justify-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1.5 text-xs text-red-500 active:opacity-80"
                >
                  <Icon name="delete" className="h-3.5 w-3.5" />
                  {t("admin.delete")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
