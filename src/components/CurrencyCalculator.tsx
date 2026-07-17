import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "../lib/exchangeRate";
import { Icon } from "./Icon";

export function CurrencyCalculator() {
  const { t, i18n } = useTranslation();
  const { rate, fetchedAt, loading, refresh } = useExchangeRate();
  const [eur, setEur] = useState("");
  const [jpy, setJpy] = useState("");

  function onEurChange(v: string) {
    setEur(v);
    const n = Number(v.replace(",", "."));
    setJpy(v.trim() !== "" && Number.isFinite(n) ? String(Math.round(n * rate)) : "");
  }

  function onJpyChange(v: string) {
    setJpy(v);
    const n = Number(v.replace(",", "."));
    setEur(v.trim() !== "" && Number.isFinite(n) ? (n / rate).toFixed(2) : "");
  }

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-text">
        <Icon name="calculate" className="h-6 w-6 text-accent" />
        {t("calculator.title")}
      </h1>
      <p className="text-sm text-muted">{t("calculator.subtitle")}</p>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t("calculator.eur")}</span>
          <input
            value={eur}
            onChange={(e) => onEurChange(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            className="rounded-lg border border-line bg-app-bg px-3 py-2 text-2xl font-semibold text-text"
          />
        </label>

        <div className="flex items-center justify-center text-muted">
          <Icon name="swap_horiz" className="h-5 w-5" />
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t("calculator.jpy")}</span>
          <input
            value={jpy}
            onChange={(e) => onJpyChange(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            className="rounded-lg border border-line bg-app-bg px-3 py-2 text-2xl font-semibold text-text"
          />
        </label>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
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
  );
}
