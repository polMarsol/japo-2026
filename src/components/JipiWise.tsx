import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EXPENSE_CATEGORIES, categoryIcon, type ExpenseCategory } from "../lib/expenseCategories";
import { TRAVELERS } from "../lib/travelers";
import { useExchangeRate, toEur, formatAmount } from "../lib/exchangeRate";
import type { Currency } from "../lib/expensesSync";
import {
  useJipiwiseExpenses,
  useSettlements,
  uploadReceipt,
  type JipiwiseExpenseRow,
  type JipiwiseExpenseInput,
} from "../lib/jipiwiseSync";
import {
  computeNetBalances,
  simplifyDebts,
  computeShares,
  type SplitMethod,
  type Share,
} from "../lib/debtSimplify";
import { downloadCsv } from "../lib/csvExport";
import { Icon } from "./Icon";
import { BreakdownList } from "./BreakdownList";

const LAST_CURRENCY_KEY = "japo2026:jipiwiseCurrency";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function PersonChips({
  names,
  selected,
  onToggle,
}: {
  names: string[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onToggle(name)}
          className={`rounded-full px-2.5 py-1.5 text-xs font-medium ${
            selected.includes(name) ? "bg-accent text-white" : "bg-chip text-chip-text"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function JipiWiseForm({
  initial,
  onSubmit,
  onCancel,
  t,
}: {
  initial?: JipiwiseExpenseInput;
  onSubmit: (data: JipiwiseExpenseInput) => void;
  onCancel: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [currency, setCurrency] = useState<Currency>(
    initial?.currency ?? ((localStorage.getItem(LAST_CURRENCY_KEY) as Currency) || "EUR"),
  );
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "food");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(initial?.split_method ?? "equal");
  const [payerNames, setPayerNames] = useState<string[]>(
    initial?.payers.map((p) => p.name) ?? [TRAVELERS[0]],
  );
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>(
    Object.fromEntries((initial?.payers ?? []).map((p) => [p.name, String(p.amount)])),
  );
  const [participantNames, setParticipantNames] = useState<string[]>(
    initial?.shares.map((s) => s.name) ?? [...TRAVELERS],
  );
  const [participantValues, setParticipantValues] = useState<Record<string, string>>(
    Object.fromEntries((initial?.shares ?? []).map((s) => [s.name, String(s.amount)])),
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initial?.receipt_url ?? null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const amountNum = Number(amount.replace(",", "."));
  const validAmount = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  function togglePayer(name: string) {
    setPayerNames((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }
  function toggleParticipant(name: string) {
    setParticipantNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  const payersComputed: Share[] = useMemo(() => {
    if (payerNames.length === 0) return [];
    if (payerNames.length === 1) {
      return [{ name: payerNames[0], amount: validAmount ? round2(amountNum) : 0 }];
    }
    return payerNames.map((name) => ({
      name,
      amount: round2(Number((payerAmounts[name] ?? "").replace(",", ".")) || 0),
    }));
  }, [payerNames, payerAmounts, amountNum, validAmount]);
  const payersSum = round2(payersComputed.reduce((s, p) => s + p.amount, 0));
  const payersOk =
    payerNames.length > 0 &&
    (payerNames.length === 1 || Math.abs(payersSum - round2(amountNum || 0)) < 0.01);

  const sharesComputed: Share[] = useMemo(() => {
    if (participantNames.length === 0 || !validAmount) return [];
    if (splitMethod === "equal") {
      return computeShares(
        "equal",
        amountNum,
        participantNames.map((name) => ({ name, value: 0 })),
      );
    }
    return computeShares(
      splitMethod,
      amountNum,
      participantNames.map((name) => ({
        name,
        value: Number((participantValues[name] ?? "").replace(",", ".")) || 0,
      })),
    );
  }, [participantNames, participantValues, splitMethod, amountNum, validAmount]);

  const sharesRaw =
    splitMethod === "percentage"
      ? round2(
          participantNames.reduce(
            (s, n) => s + (Number((participantValues[n] ?? "").replace(",", ".")) || 0),
            0,
          ),
        )
      : round2(sharesComputed.reduce((s, p) => s + p.amount, 0));
  const sharesTarget = splitMethod === "percentage" ? 100 : round2(amountNum || 0);
  const sharesOk =
    participantNames.length > 0 && (splitMethod === "equal" || Math.abs(sharesRaw - sharesTarget) < 0.01);

  const valid = validAmount && description.trim() !== "" && payersOk && sharesOk;

  async function handleFile(file: File) {
    setUploadingReceipt(true);
    const url = await uploadReceipt(file);
    setUploadingReceipt(false);
    if (url) setReceiptUrl(url);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-accent/40 bg-accent-soft/40 p-3">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("jipiwise.descriptionPlaceholder")}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-text"
      />

      <div className="flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={currency === "JPY" ? "0 ¥" : "0.00 €"}
          inputMode="decimal"
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
              category === c.key ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            <Icon name={c.icon} className="h-3.5 w-3.5" />
            {t(`expenses.categories.${c.key}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">{t("jipiwise.paidBy")}</span>
        <PersonChips names={TRAVELERS} selected={payerNames} onToggle={togglePayer} />
        {payerNames.length > 1 && (
          <div className="flex flex-col gap-1 pt-1">
            {payerNames.map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-20 shrink-0 truncate text-xs text-text">{name}</span>
                <input
                  value={payerAmounts[name] ?? ""}
                  onChange={(e) => setPayerAmounts((p) => ({ ...p, [name]: e.target.value }))}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-24 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-text"
                />
              </div>
            ))}
            <span className={`text-[11px] ${payersOk ? "text-muted" : "text-red-500"}`}>
              {t("jipiwise.sumCheck", { sum: payersSum, target: round2(amountNum || 0) })}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">{t("jipiwise.splitBetween")}</span>
        <PersonChips names={TRAVELERS} selected={participantNames} onToggle={toggleParticipant} />

        <div className="flex self-start overflow-hidden rounded-lg border border-line">
          {(["equal", "exact", "percentage"] as SplitMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSplitMethod(m)}
              className={`px-2.5 py-1 text-[11px] font-medium ${
                splitMethod === m ? "bg-accent text-white" : "bg-surface text-muted"
              }`}
            >
              {t(`jipiwise.splitMethod.${m}`)}
            </button>
          ))}
        </div>

        {splitMethod !== "equal" && (
          <div className="flex flex-col gap-1 pt-1">
            {participantNames.map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-20 shrink-0 truncate text-xs text-text">{name}</span>
                <input
                  value={participantValues[name] ?? ""}
                  onChange={(e) => setParticipantValues((p) => ({ ...p, [name]: e.target.value }))}
                  inputMode="decimal"
                  placeholder={splitMethod === "percentage" ? "%" : "0.00"}
                  className="w-24 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-text"
                />
              </div>
            ))}
            <span className={`text-[11px] ${sharesOk ? "text-muted" : "text-red-500"}`}>
              {splitMethod === "percentage"
                ? t("jipiwise.sumCheckPercent", { sum: sharesRaw })
                : t("jipiwise.sumCheck", { sum: sharesRaw, target: sharesTarget })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingReceipt}
          className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1.5 text-xs text-chip-text active:opacity-80 disabled:opacity-50"
        >
          <Icon name="photo_camera" className="h-3.5 w-3.5" />
          {uploadingReceipt
            ? t("jipiwise.uploadingReceipt")
            : receiptUrl
              ? t("jipiwise.receiptAttached")
              : t("jipiwise.attachReceipt")}
        </button>
        {receiptUrl && <img src={receiptUrl} alt="" className="h-8 w-8 rounded object-cover" />}
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
            onSubmit({
              description: description.trim(),
              amount: round2(amountNum),
              currency,
              category,
              split_method: splitMethod,
              payers: payersComputed,
              shares: sharesComputed,
              receipt_url: receiptUrl,
              notes: notes.trim() || null,
            })
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

export function JipiWise() {
  const { t, i18n } = useTranslation();
  const { expenses, addExpense, updateExpense, deleteExpense } = useJipiwiseExpenses();
  const { settlements, addSettlement } = useSettlements();
  const { rate } = useExchangeRate();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const balances = useMemo(() => computeNetBalances(expenses, settlements, rate), [expenses, settlements, rate]);
  const suggestions = useMemo(() => simplifyDebts(balances), [balances]);

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
      .filter((e) => e.payers.some((p) => p.name === name))
      .reduce(
        (s, e) => s + toEur(e.payers.find((p) => p.name === name)?.amount ?? 0, e.currency, rate),
        0,
      ),
  })).filter((r) => r.amount > 0);
  const maxPerson = Math.max(0, ...byPerson.map((r) => r.amount));

  function exportCsv() {
    downloadCsv(
      "jipiwise.csv",
      [
        t("jipiwise.csv.date"),
        t("jipiwise.csv.description"),
        t("jipiwise.csv.amount"),
        t("jipiwise.csv.currency"),
        t("jipiwise.csv.category"),
        t("jipiwise.csv.payers"),
        t("jipiwise.csv.shares"),
        t("jipiwise.csv.notes"),
      ],
      expenses.map((e) => [
        dateFormatter.format(new Date(e.created_at)),
        e.description,
        e.amount,
        e.currency,
        t(`expenses.categories.${e.category}`),
        e.payers.map((p) => `${p.name}: ${p.amount}`).join(" / "),
        e.shares.map((s) => `${s.name}: ${s.amount}`).join(" / "),
        e.notes ?? "",
      ]),
    );
  }

  function editRow(item: JipiwiseExpenseRow) {
    return (
      <JipiWiseForm
        t={t}
        initial={item}
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
      <div className="flex items-center gap-2">
        <Icon name="groups" className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-semibold text-text">{t("jipiwise.title")}</h1>
      </div>
      <p className="rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 p-3 text-xs text-accent">
        {t("jipiwise.disclaimer")}
      </p>

      {adding ? (
        <JipiWiseForm
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
          {t("jipiwise.addExpense")}
        </button>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
        <h2 className="text-sm font-semibold text-text">{t("jipiwise.balances")}</h2>
        {TRAVELERS.map((name) => {
          const b = balances[name] ?? 0;
          const settled = Math.abs(b) < 0.01;
          return (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="text-text">{name}</span>
              {settled ? (
                <span className="text-xs text-muted">{t("jipiwise.settled")}</span>
              ) : (
                <span className={`font-semibold ${b > 0 ? "text-green-600" : "text-red-500"}`}>
                  {b > 0 ? "+" : ""}
                  {formatAmount(b, "EUR")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text">
            <Icon name="balance" className="h-4 w-4 text-accent" />
            {t("jipiwise.simplify")}
          </h2>
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-text">
                <b>{s.from}</b> → <b>{s.to}</b>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">{formatAmount(s.amountEur, "EUR")}</span>
                <button
                  type="button"
                  onClick={() => addSettlement(s.from, s.to, s.amountEur)}
                  className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[11px] text-white active:opacity-80"
                >
                  <Icon name="handshake" className="h-3 w-3" />
                  {t("jipiwise.markPaid")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BreakdownList
        title={t("expenses.byCategory")}
        rows={byCategory}
        max={maxCategory}
        fmt={(v) => formatAmount(v, "EUR")}
        icons
      />
      <BreakdownList
        title={t("expenses.byPerson")}
        rows={byPerson}
        max={maxPerson}
        fmt={(v) => formatAmount(v, "EUR")}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">{t("jipiwise.history")}</h2>
        {expenses.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
          >
            <Icon name="download" className="h-3.5 w-3.5" />
            {t("jipiwise.exportCsv")}
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {expenses.length === 0 && (
          <li className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-8 text-muted">
            <Icon name="groups" className="h-6 w-6" />
            <span className="text-sm">{t("jipiwise.noExpenses")}</span>
          </li>
        )}
        {expenses.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon name={categoryIcon(item.category)} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{item.description}</p>
                <p className="truncate text-xs text-muted">
                  {item.payers.map((p) => p.name).join(", ")} ·{" "}
                  {dateFormatter.format(new Date(item.created_at))}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-text">
                  {formatAmount(Number(item.amount), item.currency)}
                </p>
              </div>
              {item.receipt_url && (
                <img src={item.receipt_url} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
              )}
              <button
                type="button"
                onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
              >
                <Icon name="edit" className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="pl-12 text-[11px] text-muted">
              {t("jipiwise.splitAmong")}:{" "}
              {item.shares.map((s) => `${s.name} (${formatAmount(s.amount, item.currency)})`).join(", ")}
            </p>
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
