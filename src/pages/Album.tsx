import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { TRAVELERS } from "../lib/travelers";
import { syncEnabled } from "../lib/supabase";
import { deleteTripPhoto, uploadTripPhoto, useTripPhotos, type TripPhotoRow } from "../lib/tripPhotosSync";
import { Icon } from "../components/Icon";

const LAST_PERSON_KEY = "japo2026:albumPerson";

export function Album() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const trip = useMemo(() => db.index.filter((e) => e.date), [db]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultDay = String(trip.find((e) => e.date === todayStr)?.day ?? trip[0]?.day ?? "1");
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const [person, setPerson] = useState(() => localStorage.getItem(LAST_PERSON_KEY) || TRAVELERS[0]);
  const [place, setPlace] = useState("");
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [openPhoto, setOpenPhoto] = useState<TripPhotoRow | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const { list } = useTripPhotos();
  const dayPhotos = useMemo(() => list.filter((p) => p.day === selectedDay), [list, selectedDay]);
  const placesToday = useMemo(() => [...new Set(dayPhotos.map((p) => p.place))], [dayPhotos]);

  const grouped = useMemo(() => {
    const groups = new Map<string, TripPhotoRow[]>();
    for (const photo of dayPhotos) {
      if (!groups.has(photo.place)) groups.set(photo.place, []);
      groups.get(photo.place)!.push(photo);
    }
    return [...groups.entries()];
  }, [dayPhotos]);

  function selectPerson(p: string) {
    setPerson(p);
    localStorage.setItem(LAST_PERSON_KEY, p);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const trimmedPlace = place.trim() || t("album.noPlace");
    setUploadError(false);
    setUploading({ done: 0, total: files.length });
    let anyFailed = false;
    for (let i = 0; i < files.length; i++) {
      const ok = await uploadTripPhoto(files[i], selectedDay, trimmedPlace, person);
      if (!ok) anyFailed = true;
      setUploading({ done: i + 1, total: files.length });
    }
    setUploading(null);
    if (anyFailed) setUploadError(true);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">{t("album.title")}</h1>
        <p className="text-xs text-muted">{t("album.subtitle")}</p>
      </div>

      {!syncEnabled && (
        <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-xs text-muted">
          {t("admin.syncDisabled")}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {trip.map((e) => (
          <button
            key={String(e.day)}
            type="button"
            onClick={() => setSelectedDay(String(e.day))}
            className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-1.5 text-xs font-medium ${
              selectedDay === String(e.day) ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            <span>{t("days.day")} {e.day}</span>
            <span className="opacity-75">{e.date?.slice(5)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TRAVELERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => selectPerson(p)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                person === p ? "bg-accent text-white" : "bg-chip text-chip-text"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={t("album.placePlaceholder")}
          className="w-full rounded-xl border border-line bg-app-bg px-3 py-2 text-sm text-text placeholder:text-muted"
        />

        {placesToday.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {placesToday.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlace(p)}
                className="rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={!syncEnabled || uploading !== null}
            onClick={() => cameraRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-medium text-white disabled:opacity-50"
          >
            <Icon name="photo_camera" className="h-4 w-4" />
            {t("album.takePhoto")}
          </button>
          <button
            type="button"
            disabled={!syncEnabled || uploading !== null}
            onClick={() => galleryRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-chip py-2.5 text-xs font-medium text-chip-text disabled:opacity-50"
          >
            <Icon name="photo_library" className="h-4 w-4" />
            {t("album.pickFromGallery")}
          </button>
        </div>

        {uploading && (
          <p className="text-center text-xs text-muted">
            {t("album.uploading", { done: uploading.done, total: uploading.total })}
          </p>
        )}
        {uploadError && (
          <p className="text-center text-xs text-red-500">{t("album.uploadError")}</p>
        )}
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-center text-xs text-muted">
          {t("album.noPhotos")}
        </p>
      ) : (
        grouped.map(([placeName, photos]) => (
          <section key={placeName} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-medium text-text">
              <Icon name="location_on" className="h-4 w-4 text-accent" />
              {placeName}
              <span className="text-muted">({photos.length})</span>
            </h2>
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setOpenPhoto(photo)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-chip"
                >
                  <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-active:bg-black/30 group-active:opacity-100">
                    <Icon name="zoom_in" className="h-5 w-5 text-white" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      {openPhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={() => setOpenPhoto(null)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{openPhoto.place}</span>
              <span className="text-xs text-white/70">
                {openPhoto.uploaded_by ?? "?"} · {new Date(openPhoto.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTripPhoto(openPhoto.id);
                  setOpenPhoto(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:opacity-80"
              >
                <Icon name="delete" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpenPhoto(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:opacity-80"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <img src={openPhoto.url} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
