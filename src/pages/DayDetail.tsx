import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDay, useLocalizedDb } from "../lib/db";
import { OutlineNode } from "../components/OutlineNode";
import { PlaceHighlights } from "../components/PlaceHighlights";
import { Icon } from "../components/Icon";
import { ChecklistProvider } from "../lib/checklist";
import { useDayProgress, useDayNotes } from "../lib/dayState";
import { regroupTree } from "../lib/outline";
import { buildAccommodationLinkMap, injectAccommodationLink } from "../lib/accommodationLinks";

export function DayDetail() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const { day } = useParams();
  const outline = day ? getDay(db, day) : undefined;
  const sections = useMemo(() => {
    if (!outline || !day) return [];
    const accLink = buildAccommodationLinkMap(db)[day];
    return injectAccommodationLink(regroupTree(outline.sections), accLink);
  }, [outline, day, db]);
  const { isDone, toggle } = useDayProgress();
  const { notes, setNotes } = useDayNotes(day ?? "");

  if (!outline || !day) {
    return (
      <div className="p-4">
        <p className="text-muted">{t("dayDetail.notFound")}</p>
        <Link to="/dies" className="text-accent">
          {t("dayDetail.backToDays")}
        </Link>
      </div>
    );
  }

  const done = isDone(day);

  return (
    <ChecklistProvider day={day}>
      <div className="flex flex-col gap-3 p-4 pb-8">
        <Link to="/dies" className="flex items-center gap-1 text-sm text-muted">
          <Icon name="chevron_left" className="h-4 w-4" />
          {t("dayDetail.back")}
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold leading-snug text-text">
            {outline.title}
          </h1>
          <button
            type="button"
            onClick={() => toggle(day)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              done
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-muted"
            }`}
          >
            <Icon name="check_circle" className="h-4 w-4" />
            {done ? t("dayDetail.done") : t("dayDetail.markDone")}
          </button>
        </div>

        <PlaceHighlights day={day} />

        <div className="flex flex-col gap-3">
          {sections.map((node, i) => (
            <OutlineNode key={i} node={node} depth={0} />
          ))}
        </div>

        <section className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text">
            <Icon name="edit_note" className="h-[18px] w-[18px]" />
            {t("dayDetail.notesHeading")}
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("dayDetail.notesPlaceholder")}
            rows={4}
            className="resize-none rounded-lg border border-line bg-app-bg p-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </section>
      </div>
    </ChecklistProvider>
  );
}
