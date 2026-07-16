import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { getDayHeroPhoto, photoUrl } from "../lib/photos";
import { useDayProgress } from "../lib/dayState";
import { Icon } from "../components/Icon";

type ViewMode = "agenda" | "cards";
const VIEW_KEY = "japo2026:daysView";

function useViewMode(): [ViewMode, (v: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) as ViewMode) || "agenda",
  );
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);
  return [view, setView];
}

export function Days() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const [view, setView] = useViewMode();
  const { isDone, toggle, count } = useDayProgress();
  const trip = db.index.filter((e) => e.date && db.days[String(e.day)]);
  const totalDays = Object.keys(db.days).length;

  const months = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    year: "numeric",
  });
  const weekdayFmt = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });

  let lastMonth = "";

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-text">{t("days.title")}</h1>
        <div className="flex items-center gap-0.5 rounded-full border border-line p-0.5">
          <button
            type="button"
            onClick={() => setView("agenda")}
            aria-label={t("days.viewAgenda")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "agenda" ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            <Icon name="view_agenda" className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setView("cards")}
            aria-label={t("days.viewCards")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "cards" ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            <Icon name="view_carousel" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted">
        {t("days.progress", { done: count, total: totalDays })}
      </p>

      {view === "agenda" ? (
        <div className="flex flex-col">
          {trip.map((entry) => {
            const date = entry.date ? new Date(entry.date) : null;
            const monthLabel = date ? months.format(date) : "";
            const showMonthHeader = monthLabel !== lastMonth;
            lastMonth = monthLabel;
            const day = String(entry.day);
            const done = isDone(day);
            const photo = getDayHeroPhoto(i18n.language, day);

            return (
              <div key={day}>
                {showMonthHeader && (
                  <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-muted first:mt-0">
                    {monthLabel}
                  </p>
                )}
                <Link
                  to={`/dies/${day}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 active:bg-chip"
                >
                  <div className="flex w-11 shrink-0 flex-col items-center leading-tight">
                    <span className="text-[10px] uppercase text-muted">
                      {date ? weekdayFmt.format(date) : ""}
                    </span>
                    <span className="text-base font-semibold text-text">
                      {date ? date.getDate() : entry.day}
                    </span>
                  </div>
                  {photo ? (
                    <img
                      src={photoUrl(photo)}
                      alt=""
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-chip">
                      <Icon name="explore" className="h-5 w-5 text-muted" />
                    </div>
                  )}
                  <span className="flex-1 text-sm text-text">{entry.route}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(day);
                    }}
                    className={done ? "text-accent" : "text-muted"}
                  >
                    <Icon
                      name={done ? "check_circle" : "radio_button_unchecked"}
                      className="h-5 w-5"
                    />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trip.map((entry) => {
            const day = String(entry.day);
            const date = entry.date ? new Date(entry.date) : null;
            const photo = getDayHeroPhoto(i18n.language, day);
            const done = isDone(day);

            return (
              <Link
                key={day}
                to={`/dies/${day}`}
                className="relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface"
              >
                {photo ? (
                  <img
                    src={photoUrl(photo)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-chip">
                    <Icon name="explore" className="h-10 w-10 text-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(day);
                  }}
                  className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur ${
                    done ? "bg-accent text-white" : "bg-black/40 text-white"
                  }`}
                >
                  <Icon
                    name={done ? "check_circle" : "radio_button_unchecked"}
                    className="h-5 w-5"
                  />
                </button>

                <div className="relative z-10 flex flex-col gap-0.5 p-3.5 text-white">
                  <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {t("days.day")} {day} · {date?.toLocaleDateString(i18n.language, { day: "numeric", month: "short" })}
                  </span>
                  <span className="text-base font-semibold leading-snug">{entry.route}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
