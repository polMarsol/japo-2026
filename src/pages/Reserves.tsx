import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { Icon } from "../components/Icon";
import { extractInlineLinks } from "../lib/outline";

const statusStyle: Record<string, string> = {
  paid: "bg-green-500/15 text-green-600 dark:text-green-400",
  reserved: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  pending: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  unknown: "bg-chip text-muted",
};

function formatCost(v: number | string | null) {
  if (v === null || v === undefined) return "—";
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)} €` : String(v);
}

export function Reserves() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const { items, total } = db.reservations;

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <h1 className="text-2xl font-semibold text-text">{t("reservations.title")}</h1>
      {total && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm text-muted">{t("reservations.totalTrip")}</p>
          <p className="text-2xl font-semibold text-text">
            {formatCost(total.costTotal)}
          </p>
          <p className="text-sm text-muted">
            {formatCost(total.costPerPerson)} {t("reservations.perPerson")}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const notes = item.notes ? extractInlineLinks(item.notes) : null;
          return (
            <li
              key={i}
              className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-text">{item.concept}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusStyle[item.statusKey]}`}
                >
                  {t(`reservations.status.${item.statusKey}`)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{formatCost(item.costTotal)}</span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
                  >
                    <Icon name="open_in_new" className="h-3.5 w-3.5" />
                    {t("reservations.open")}
                  </a>
                )}
              </div>
              {notes && (notes.clean || notes.links.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  {notes.clean && (
                    <p className="whitespace-pre-line text-xs text-muted">{notes.clean}</p>
                  )}
                  {notes.links.map((href, j) => (
                    <a
                      key={j}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-xs text-chip-text active:opacity-80"
                    >
                      <Icon name="open_in_new" className="h-3 w-3" />
                      {t("reservations.open")}
                    </a>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
