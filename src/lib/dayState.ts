import { useEffect, useState } from "react";

const DONE_KEY = "japo2026:daysDone";
const NOTES_PREFIX = "japo2026:notes:";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useDayProgress() {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    readJson(DONE_KEY, {}),
  );

  useEffect(() => {
    localStorage.setItem(DONE_KEY, JSON.stringify(done));
  }, [done]);

  const toggle = (day: string) =>
    setDone((d) => ({ ...d, [day]: !d[day] }));

  const count = Object.values(done).filter(Boolean).length;

  return { done, toggle, count, isDone: (day: string) => Boolean(done[day]) };
}

export function useDayNotes(day: string) {
  const key = `${NOTES_PREFIX}${day}`;
  const [notes, setNotesState] = useState(() => localStorage.getItem(key) ?? "");

  const setNotes = (value: string) => {
    setNotesState(value);
    localStorage.setItem(key, value);
  };

  return { notes, setNotes };
}
