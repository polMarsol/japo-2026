import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getHighlights } from "../data/enrichment";
import { photoUrl } from "../lib/photos";
import { usePlacePhoto } from "../lib/photoOverrides";
import { useAuth } from "../lib/auth";
import { syncEnabled } from "../lib/supabase";
import { Icon } from "./Icon";

function PhotoEditForm({
  initialUrl,
  initialCredit,
  isOverride,
  onSave,
  onClear,
  onCancel,
  t,
}: {
  initialUrl: string;
  initialCredit: string;
  isOverride: boolean;
  onSave: (url: string, credit: string) => void;
  onClear: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [credit, setCredit] = useState(initialCredit);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-accent/40 bg-accent-soft/40 p-2.5">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t("admin.photoUrl")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-text"
        autoFocus
      />
      <input
        value={credit}
        onChange={(e) => setCredit(e.target.value)}
        placeholder={t("admin.photoCredit")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-text"
      />
      <div className="flex items-center justify-between gap-2">
        {isOverride ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-500 active:opacity-80"
          >
            <Icon name="delete" className="h-3.5 w-3.5" />
            {t("admin.removeOverride")}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
            {t("admin.cancel")}
          </button>
          <button
            type="button"
            disabled={!url.trim()}
            onClick={() => onSave(url, credit)}
            className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-white active:opacity-80 disabled:opacity-40"
          >
            <Icon name="save" className="h-3.5 w-3.5" />
            {t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlacePhotoBlock({ place, t }: { place: string; t: (k: string) => string }) {
  const { isAdmin } = useAuth();
  const { photo, isOverride, setOverride, clearOverride } = usePlacePhoto(place);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <PhotoEditForm
        t={t}
        initialUrl={isOverride ? (photo?.file ?? "") : ""}
        initialCredit={isOverride ? (photo?.credit ?? "") : ""}
        isOverride={isOverride}
        onCancel={() => setEditing(false)}
        onSave={(url, credit) => {
          setOverride(url, credit);
          setEditing(false);
        }}
        onClear={() => {
          clearOverride();
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="relative">
      {photo ? (
        <figure className="overflow-hidden rounded-lg">
          <img
            src={photoUrl(photo)}
            alt={place}
            loading="lazy"
            className="h-40 w-full object-cover"
          />
          {photo.credit && (
            <figcaption className="mt-0.5 text-[11px] text-muted">
              {photo.credit}
              {photo.license ? ` · ${photo.license}` : ""}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="flex h-16 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line text-xs text-muted">
          <Icon name="add_a_photo" className="h-4 w-4" />
          {t("highlights.photoPlaceholder")}
        </div>
      )}
      {isAdmin && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white active:opacity-80"
        >
          <Icon name="edit" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function PlaceHighlights({ day }: { day: string }) {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const highlights = getHighlights(i18n.language, day);
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
        <Icon name="auto_stories" className="h-[18px] w-[18px]" />
        {t("highlights.sectionTitle")}
      </h2>
      {isAdmin && !syncEnabled && (
        <p className="rounded-lg border border-dashed border-line bg-app-bg p-2 text-[11px] text-muted">
          {t("admin.syncDisabled")}
        </p>
      )}
      {highlights.map((h, i) => (
        <div key={i} className="flex flex-col gap-1.5 text-sm">
          <p className="font-medium text-text">{h.place}</p>
          <PlacePhotoBlock place={h.place} t={t} />
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
      ))}
    </section>
  );
}
