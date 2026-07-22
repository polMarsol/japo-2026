import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRAVELERS } from "../lib/travelers";
import { PACKING_ITEMS, PACKING_CATEGORIES } from "../lib/packingItems";
import { usePackingChecks } from "../lib/packingSync";
import { syncEnabled } from "../lib/supabase";
import { Icon } from "../components/Icon";

const LAST_PERSON_KEY = "japo2026:packingPerson";

export function Equipatge() {
  const { t } = useTranslation();
  const { rows, setChecked, isChecked } = usePackingChecks();
  const [person, setPerson] = useState(
    () => localStorage.getItem(LAST_PERSON_KEY) || TRAVELERS[0],
  );

  function selectPerson(p: string) {
    setPerson(p);
    localStorage.setItem(LAST_PERSON_KEY, p);
  }

  const byCategory = useMemo(() => {
    return PACKING_CATEGORIES.map((category) => ({
      category,
      items: PACKING_ITEMS.filter((i) => i.category === category),
    }));
  }, []);

  const checkedCount = PACKING_ITEMS.filter((i) => isChecked(person, i.id)).length;

  const perPersonCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of TRAVELERS) {
      counts[p] = PACKING_ITEMS.filter((i) => Boolean(rows[`${p}:${i.id}`])).length;
    }
    return counts;
  }, [rows]);

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">{t("packing.title")}</h1>
        <p className="text-xs text-muted">{t("packing.subtitle")}</p>
      </div>

      {!syncEnabled && (
        <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-xs text-muted">
          {t("admin.syncDisabled")}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TRAVELERS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => selectPerson(p)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              person === p ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            {p}
            <span className="opacity-80">
              {perPersonCounts[p] ?? 0}/{PACKING_ITEMS.length}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">
          {t("packing.progress", { done: checkedCount, total: PACKING_ITEMS.length })}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-chip">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${(checkedCount / PACKING_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      {byCategory.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            {t(`packing.categories.${category}`)}
          </h2>
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const checked = isChecked(person, item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setChecked(person, item.id, !checked)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left active:opacity-80"
                  >
                    <Icon
                      name={checked ? "check_circle" : "radio_button_unchecked"}
                      className={`h-5 w-5 shrink-0 ${checked ? "text-accent" : "text-muted"}`}
                    />
                    <span className={`text-sm ${checked ? "text-muted line-through" : "text-text"}`}>
                      {t(`packing.items.${item.id}`)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
