import { useTranslation } from "react-i18next";
import { getHighlights } from "../data/enrichment";
import { getPlacePhoto, photoUrl } from "../lib/photos";
import { Icon } from "./Icon";

export function PlaceHighlights({ day }: { day: string }) {
  const { t, i18n } = useTranslation();
  const highlights = getHighlights(i18n.language, day);
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
        <Icon name="auto_stories" className="h-[18px] w-[18px]" />
        {t("highlights.sectionTitle")}
      </h2>
      {highlights.map((h, i) => {
        const photo = getPlacePhoto(h.place);
        return (
          <div key={i} className="flex flex-col gap-1.5 text-sm">
            <p className="font-medium text-text">{h.place}</p>
            {photo ? (
              <figure className="overflow-hidden rounded-lg">
                <img
                  src={photoUrl(photo)}
                  alt={h.place}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
                {photo.credit && (
                  <figcaption className="mt-0.5 text-[11px] text-muted">
                    {photo.credit} · {photo.license} (Wikimedia)
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="flex h-16 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line text-xs text-muted">
                <Icon name="add_a_photo" className="h-4 w-4" />
                {t("highlights.photoPlaceholder")}
              </div>
            )}
            {h.legend && (
              <p className="leading-relaxed text-text/85">
                <span className="text-accent">{t("highlights.legend")} </span>
                {h.legend}
              </p>
            )}
            {h.curiosity && (
              <p className="leading-relaxed text-text/85">
                <span className="text-accent">{t("highlights.curiosity")} </span>
                {h.curiosity}
              </p>
            )}
            {h.tips && h.tips.length > 0 && (
              <ul className="flex flex-col gap-1">
                {h.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-1.5 leading-relaxed text-muted">
                    <Icon name="lightbulb" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
