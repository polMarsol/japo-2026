import { categoryIcon } from "../lib/expenseCategories";
import { Icon } from "./Icon";

export function BreakdownList({
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
            {icons && <Icon name={categoryIcon(r.key)} className="h-4 w-4 shrink-0 text-accent" />}
            <span className="w-20 shrink-0 truncate text-xs text-text">{r.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-chip">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${max > 0 ? (r.amount / max) * 100 : 0}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-muted">{fmt(r.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
