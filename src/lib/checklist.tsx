import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ChecklistApi {
  isChecked: (item: string) => boolean;
  toggle: (item: string) => void;
}

const ChecklistContext = createContext<ChecklistApi | null>(null);

export function ChecklistProvider({
  day,
  children,
}: {
  day: string;
  children: ReactNode;
}) {
  const storageKey = `japo2026:checklist:${day}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const api: ChecklistApi = {
    isChecked: (item) => Boolean(checked[item]),
    toggle: (item) =>
      setChecked((c) => ({ ...c, [item]: !c[item] })),
  };

  return (
    <ChecklistContext.Provider value={api}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error("useChecklist must be used inside ChecklistProvider");
  return ctx;
}
