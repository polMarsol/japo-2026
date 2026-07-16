import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth";
import { Icon } from "./Icon";

export function LockScreen() {
  const { t } = useTranslation();
  const { unlock } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleDigit(digit: string) {
    if (checking || code.length >= 4) return;
    const next = code + digit;
    setCode(next);
    setError(false);
    if (next.length === 4) {
      setChecking(true);
      const ok = await unlock(next);
      setChecking(false);
      if (!ok) {
        setError(true);
        setCode("");
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-bg p-6 safe-top safe-bottom">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
          <Icon name="lock" className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-lg font-semibold text-text">{t("appName")}</h1>
        <p className={`text-sm ${error ? "text-accent" : "text-muted"}`}>
          {error ? t("auth.wrongPin") : t("auth.enterPin")}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border ${
                error
                  ? "border-accent"
                  : i < code.length
                    ? "border-accent bg-accent"
                    : "border-line"
              }`}
            />
          ))}
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="rounded-2xl border border-line bg-surface py-4 text-lg font-medium text-text active:bg-chip"
            >
              {d}
            </button>
          ))}
          <span />
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="rounded-2xl border border-line bg-surface py-4 text-lg font-medium text-text active:bg-chip"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setCode((c) => c.slice(0, -1))}
            className="flex items-center justify-center rounded-2xl py-4 text-muted active:bg-chip"
          >
            <Icon name="backspace" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
