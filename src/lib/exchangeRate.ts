import { useEffect, useState } from "react";

// Yenes por euro. Se consulta a frankfurter.app (gratis, sin API key, datos
// del BCE) cuando hay red, y se cachea en localStorage para que la app siga
// funcionando offline con el ultimo valor conocido (o un valor por defecto
// razonable si nunca se ha podido consultar).
const STORAGE_KEY = "japo2026:jpyRate";
const DEFAULT_RATE = 160;
const API_URL = "https://api.frankfurter.dev/v1/latest?from=EUR&to=JPY";

interface CachedRate {
  rate: number;
  fetchedAt: string;
}

function readCache(): CachedRate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CachedRate) : null;
  } catch {
    return null;
  }
}

function writeCache(rate: number) {
  const entry: CachedRate = { rate, fetchedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  return entry;
}

export function useExchangeRate() {
  const [cached, setCached] = useState<CachedRate | null>(() => readCache());
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = (await res.json()) as { rates?: { JPY?: number } };
      const rate = data.rates?.JPY;
      if (rate) setCached(writeCache(rate));
    } catch {
      // sin red: nos quedamos con el valor cacheado (o el por defecto)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const isStale =
      !cached || Date.now() - new Date(cached.fetchedAt).getTime() > 12 * 60 * 60 * 1000;
    if (isStale) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    rate: cached?.rate ?? DEFAULT_RATE,
    fetchedAt: cached?.fetchedAt ?? null,
    loading,
    refresh,
  };
}

export function toEur(amount: number, currency: "EUR" | "JPY", rate: number): number {
  return currency === "JPY" ? amount / rate : amount;
}

export function formatAmount(amount: number, currency: "EUR" | "JPY"): string {
  return currency === "JPY" ? `¥${Math.round(amount).toLocaleString()}` : `${amount.toFixed(2)} €`;
}
