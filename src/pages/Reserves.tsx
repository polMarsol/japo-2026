import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedDb } from "../lib/db";
import { useAuth } from "../lib/auth";
import { useSyncedReservations, type SyncedReservation } from "../lib/reservationsSync";
import { syncEnabled } from "../lib/supabase";
import { Icon } from "../components/Icon";
import { extractInlineLinks } from "../lib/outline";

const statusStyle: Record<string, string> = {
  paid: "bg-green-500/15 text-green-600 dark:text-green-400",
  reserved: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  pending: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  unknown: "bg-chip text-muted",
};

const STATUS_CYCLE: Array<SyncedReservation["statusKey"]> = ["pending", "reserved", "paid"];

function formatCost(v: number | string | null) {
  if (v === null || v === undefined) return "—";
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)} €` : String(v);
}

function EditForm({
  item,
  onSave,
  onDelete,
  onCancel,
  t,
}: {
  item: SyncedReservation;
  onSave: (patch: {
    concept?: string;
    costTotal: string;
    costPerPerson: string;
    notes: string;
    link: string;
  }) => void;
  onDelete: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  const [concept, setConcept] = useState(item.concept);
  const [costTotal, setCostTotal] = useState(String(item.costTotal ?? ""));
  const [costPerPerson, setCostPerPerson] = useState(String(item.costPerPerson ?? ""));
  const [notes, setNotes] = useState(item.notes ?? "");
  const [link, setLink] = useState(item.link ?? "");

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 p-3">
      {item.custom && (
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder={t("admin.concept")}
          className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        />
      )}
      <div className="flex gap-2">
        <input
          value={costTotal}
          onChange={(e) => setCostTotal(e.target.value)}
          placeholder={t("admin.costTotal")}
          inputMode="decimal"
          className="w-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        />
        <input
          value={costPerPerson}
          onChange={(e) => setCostPerPerson(e.target.value)}
          placeholder={t("admin.costPerPerson")}
          inputMode="decimal"
          className="w-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        />
      </div>
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder={t("admin.link")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("admin.notes")}
        rows={2}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-500 active:opacity-80"
        >
          <Icon name="delete" className="h-3.5 w-3.5" />
          {t("admin.delete")}
        </button>
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
            onClick={() => onSave({ concept, costTotal, costPerPerson, notes, link })}
            className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-white active:opacity-80"
          >
            <Icon name="save" className="h-3.5 w-3.5" />
            {t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewReservationForm({
  onCreate,
  onCancel,
  t,
}: {
  onCreate: (data: {
    concept: string;
    costTotal: string;
    costPerPerson: string;
    notes: string;
    link: string;
  }) => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  const [concept, setConcept] = useState("");
  const [costTotal, setCostTotal] = useState("");
  const [costPerPerson, setCostPerPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 p-3">
      <input
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        placeholder={t("admin.concept")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        autoFocus
      />
      <div className="flex gap-2">
        <input
          value={costTotal}
          onChange={(e) => setCostTotal(e.target.value)}
          placeholder={t("admin.costTotal")}
          inputMode="decimal"
          className="w-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        />
        <input
          value={costPerPerson}
          onChange={(e) => setCostPerPerson(e.target.value)}
          placeholder={t("admin.costPerPerson")}
          inputMode="decimal"
          className="w-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
        />
      </div>
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder={t("admin.link")}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("admin.notes")}
        rows={2}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-text"
      />
      <div className="flex justify-end gap-2">
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
          disabled={!concept.trim()}
          onClick={() => onCreate({ concept, costTotal, costPerPerson, notes, link })}
          className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-white active:opacity-80 disabled:opacity-40"
        >
          <Icon name="check" className="h-3.5 w-3.5" />
          {t("admin.add")}
        </button>
      </div>
    </div>
  );
}

export function Reserves() {
  const { t, i18n } = useTranslation();
  const db = useLocalizedDb(i18n.language);
  const { isAdmin } = useAuth();
  const { items, updateReservation, deleteReservation, addReservation } =
    useSyncedReservations(db.reservations.items);
  const { total } = db.reservations;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function parseNum(v: string): number | null {
    const n = Number(v.replace(",", "."));
    return v.trim() === "" || !Number.isFinite(n) ? null : n;
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">{t("reservations.title")}</h1>
        {isAdmin && (
          <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
            <Icon name="admin_panel_settings" className="h-3.5 w-3.5" />
            {t("admin.badge")}
          </span>
        )}
      </div>

      {isAdmin && !syncEnabled && (
        <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-xs text-muted">
          {t("admin.syncDisabled")}
        </p>
      )}

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
        {items.map((item) => {
          const notes = item.notes ? extractInlineLinks(item.notes) : null;
          const editing = editingId === item.id;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-text">{item.concept}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => {
                      const idx = STATUS_CYCLE.indexOf(item.statusKey as never);
                      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
                      updateReservation(item.id, item.custom, { statusKey: next });
                    }}
                    className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[item.statusKey]}`}
                  >
                    {t(`reservations.status.${item.statusKey}`)}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEditingId(editing ? null : item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
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
              {(item.checkIn || item.checkOut) && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  {item.checkIn && (
                    <a
                      href={item.checkInLink ?? undefined}
                      target={item.checkInLink ? "_blank" : undefined}
                      rel="noreferrer"
                      className={`flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-chip-text ${
                        item.checkInLink ? "active:opacity-80" : "pointer-events-none"
                      }`}
                    >
                      <Icon name="flight_takeoff" className="h-3 w-3" />
                      {t("reservations.checkIn")}: {item.checkIn}
                    </a>
                  )}
                  {item.checkOut && (
                    <a
                      href={item.checkOutLink ?? undefined}
                      target={item.checkOutLink ? "_blank" : undefined}
                      rel="noreferrer"
                      className={`flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-chip-text ${
                        item.checkOutLink ? "active:opacity-80" : "pointer-events-none"
                      }`}
                    >
                      <Icon name="sports_score" className="h-3 w-3" />
                      {t("reservations.checkOut")}: {item.checkOut}
                    </a>
                  )}
                </div>
              )}
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
              {editing && (
                <EditForm
                  item={item}
                  t={t}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => {
                    deleteReservation(item.id, item.custom);
                    setEditingId(null);
                  }}
                  onSave={(patch) => {
                    updateReservation(item.id, item.custom, {
                      ...(item.custom ? { concept: patch.concept } : {}),
                      costTotal: parseNum(patch.costTotal),
                      costPerPerson: parseNum(patch.costPerPerson),
                      notes: patch.notes.trim() || null,
                      link: patch.link.trim() || null,
                    });
                    setEditingId(null);
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>

      {isAdmin && (
        <>
          {creating ? (
            <NewReservationForm
              t={t}
              onCancel={() => setCreating(false)}
              onCreate={(data) => {
                addReservation({
                  date: null,
                  concept: data.concept,
                  link: data.link.trim() || null,
                  status: null,
                  costTotal: parseNum(data.costTotal),
                  costPerPerson: parseNum(data.costPerPerson),
                  responsible: null,
                  notes: data.notes.trim() || null,
                  notesLink: null,
                });
                setCreating(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 text-sm font-medium text-muted active:bg-chip"
            >
              <Icon name="add" className="h-4 w-4" />
              {t("admin.addReservation")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
