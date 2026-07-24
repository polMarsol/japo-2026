import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EMERGENCY_PHRASES, PHRASE_CATEGORIES, type PhraseCategory } from "../data/emergencyPhrases";
import { EMBASSY, INSURANCE, JAPAN_EMERGENCY_NUMBERS, KOBAN_RETURN_RATE } from "../data/emergencyInfo";
import { Icon } from "../components/Icon";
import { isSpeechSupported, speakJapanese, useHasJapaneseVoice } from "../lib/speech";
import { TRAVELERS } from "../lib/travelers";
import { syncEnabled } from "../lib/supabase";
import { useMedicalInfo } from "../lib/medicalInfoSync";

const LAST_MEDICAL_PERSON_KEY = "japo2026:medicalPerson";
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type Tab = "phrases" | "emergency";

export function Translator() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("phrases");
  const [category, setCategory] = useState<PhraseCategory | "all">("all");
  const [query, setQuery] = useState("");
  const hasJapaneseVoice = useHasJapaneseVoice();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMERGENCY_PHRASES.filter((phrase) => {
      if (category !== "all" && phrase.category !== category) return false;
      if (!q) return true;
      const meaning = t(`translator.phrases.${phrase.id}`).toLowerCase();
      return (
        phrase.ja.toLowerCase().includes(q) ||
        phrase.romaji.toLowerCase().includes(q) ||
        meaning.includes(q)
      );
    });
  }, [category, query, t]);

  function jumpToPhrases(cat: PhraseCategory) {
    setTab("phrases");
    setCategory(cat);
  }

  const { rows: medicalRows, setMedicalInfo } = useMedicalInfo();
  const [medicalPerson, setMedicalPerson] = useState(
    () => localStorage.getItem(LAST_MEDICAL_PERSON_KEY) || TRAVELERS[0],
  );
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const row = medicalRows[medicalPerson];
    setBloodType(row?.blood_type ?? "");
    setAllergies(row?.allergies ?? "");
    setSaved(false);
    setSaveError(false);
  }, [medicalPerson, medicalRows]);

  function selectMedicalPerson(p: string) {
    setMedicalPerson(p);
    localStorage.setItem(LAST_MEDICAL_PERSON_KEY, p);
  }

  async function saveMedicalInfo() {
    const ok = await setMedicalInfo(medicalPerson, bloodType, allergies);
    setSaved(ok);
    setSaveError(!ok);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">{t("translator.title")}</h1>
        <p className="text-xs text-muted">{t("translator.subtitle")}</p>
      </div>

      <div className="flex gap-1.5 rounded-xl bg-chip p-1">
        <button
          type="button"
          onClick={() => setTab("phrases")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium ${
            tab === "phrases" ? "bg-accent text-white" : "text-chip-text"
          }`}
        >
          {t("translator.tabs.phrases")}
        </button>
        <button
          type="button"
          onClick={() => setTab("emergency")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium ${
            tab === "emergency" ? "bg-accent text-white" : "text-chip-text"
          }`}
        >
          {t("translator.tabs.emergency")}
        </button>
      </div>

      {tab === "phrases" ? (
        <>
          <p className="rounded-xl border border-accent/40 bg-accent-soft p-3 text-xs text-text">
            {t("translator.askFirstNote")}
          </p>

          {!hasJapaneseVoice && isSpeechSupported() && (
            <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-xs text-muted">
              {t("translator.noVoice")}
            </p>
          )}

          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("translator.searchPlaceholder")}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-muted"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                category === "all" ? "bg-accent text-white" : "bg-chip text-chip-text"
              }`}
            >
              {t("translator.allCategories")}
            </button>
            {PHRASE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  category === c ? "bg-accent text-white" : "bg-chip text-chip-text"
                }`}
              >
                {t(`translator.categories.${c}`)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-line bg-surface p-3 text-center text-xs text-muted">
                {t("translator.noResults")}
              </p>
            )}
            {filtered.map((phrase) => (
              <div key={phrase.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm text-text">{t(`translator.phrases.${phrase.id}`)}</span>
                  <span className="text-base font-medium text-accent">{phrase.ja}</span>
                  <span className="text-xs italic text-muted">{phrase.romaji}</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(phrase.ja)}
                  disabled={!isSpeechSupported()}
                  aria-label={t("translator.speak")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent disabled:opacity-30"
                >
                  <Icon name="volume_up" className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Icon name="sos" className="h-[18px] w-[18px]" />
              {t("translator.emergencyInfo.numbersTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {JAPAN_EMERGENCY_NUMBERS.map((n) => (
                <a
                  key={n.id}
                  href={`tel:${n.number}`}
                  className="flex flex-col items-center gap-1 rounded-xl bg-chip px-3 py-3 text-center active:opacity-80"
                >
                  <Icon name="call" className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold text-text">{n.number}</span>
                  <span className="text-[11px] text-muted">{t(`translator.emergencyInfo.numbers.${n.id}`)}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Icon name="flag" className="h-[18px] w-[18px]" />
              {t("translator.emergencyInfo.embassyTitle")}
            </h2>
            <a
              href={EMBASSY.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5 text-xs text-text"
            >
              <Icon name="location_on" className="h-4 w-4 shrink-0 text-accent" />
              <span className="flex-1">{EMBASSY.address}</span>
              <Icon name="open_in_new" className="h-3.5 w-3.5 shrink-0 text-muted" />
            </a>
            <a href={`tel:${EMBASSY.phone}`} className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5 text-xs text-text">
              <Icon name="call" className="h-4 w-4 shrink-0 text-accent" />
              {EMBASSY.phoneDisplay}
            </a>
            <a
              href={`tel:${EMBASSY.emergencyPhone}`}
              className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2.5 text-xs font-medium text-accent"
            >
              <Icon name="sos" className="h-4 w-4 shrink-0" />
              {EMBASSY.emergencyPhoneDisplay}
            </a>
            <p className="text-[11px] leading-relaxed text-muted">{t("translator.emergencyInfo.embassyEmergencyNote")}</p>
            <a href={`mailto:${EMBASSY.email}`} className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5 text-xs text-text">
              <Icon name="mail" className="h-4 w-4 shrink-0 text-accent" />
              {EMBASSY.email}
            </a>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Icon name="account_balance_wallet" className="h-[18px] w-[18px]" />
              {t("translator.emergencyInfo.insuranceTitle")}
            </h2>
            <p className="text-sm font-medium text-text">{INSURANCE.company}</p>
            <div className="flex flex-col gap-0.5 text-xs text-muted">
              <span>{t("translator.emergencyInfo.policyNumber")}: {INSURANCE.policyNumber}</span>
              <span>{t("translator.emergencyInfo.travelNumber")}: {INSURANCE.travelNumber}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <a href={`tel:${INSURANCE.phone}`} className="flex flex-col items-center gap-1 rounded-xl bg-chip px-2 py-2.5 text-center text-[11px] text-text">
                <Icon name="call" className="h-4 w-4 text-accent" />
                {t("translator.emergencyInfo.call")}
              </a>
              <a href={`mailto:${INSURANCE.email}`} className="flex flex-col items-center gap-1 rounded-xl bg-chip px-2 py-2.5 text-center text-[11px] text-text">
                <Icon name="mail" className="h-4 w-4 text-accent" />
                {t("translator.emergencyInfo.email")}
              </a>
              <a
                href={INSURANCE.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl bg-chip px-2 py-2.5 text-center text-[11px] text-text"
              >
                <Icon name="send" className="h-4 w-4 text-accent" />
                WhatsApp
              </a>
            </div>
            <div className="flex flex-col gap-1 border-t border-line pt-2.5">
              <span className="text-xs font-medium text-text">{t("translator.emergencyInfo.coverageTitle")}</span>
              <ul className="flex flex-col gap-1">
                {INSURANCE.coverageIds.map((id) => (
                  <li key={id} className="flex items-center gap-1.5 text-xs text-muted">
                    <Icon name="check_circle" className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {t(`translator.emergencyInfo.coverage.${id}`)}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Icon name="local_police" className="h-[18px] w-[18px]" />
              {t("translator.emergencyInfo.kobanTitle")}
            </h2>
            <p className="text-xs leading-relaxed text-muted">
              {t("translator.emergencyInfo.kobanBody", { rate: KOBAN_RETURN_RATE })}
            </p>
            <button
              type="button"
              onClick={() => jumpToPhrases("police")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-medium text-muted"
            >
              <Icon name="translate" className="h-3.5 w-3.5" />
              {t("translator.emergencyInfo.seePoliceLink")}
            </button>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Icon name="local_hospital" className="h-[18px] w-[18px]" />
              {t("translator.emergencyInfo.medicalTitle")}
            </h2>
            <p className="text-[11px] leading-relaxed text-muted">{t("translator.emergencyInfo.medicalSubtitle")}</p>

            {!syncEnabled && (
              <p className="rounded-xl border border-dashed border-line bg-app-bg p-2.5 text-[11px] text-muted">
                {t("admin.syncDisabled")}
              </p>
            )}

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {TRAVELERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectMedicalPerson(p)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    medicalPerson === p ? "bg-accent text-white" : "bg-chip text-chip-text"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="rounded-xl border border-line bg-app-bg px-3 py-2 text-sm text-text"
              >
                <option value="">{t("translator.emergencyInfo.bloodTypeUnknown")}</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={t("translator.emergencyInfo.allergiesPlaceholder")}
                className="min-w-0 flex-1 rounded-xl border border-line bg-app-bg px-3 py-2 text-sm text-text placeholder:text-muted"
              />
            </div>

            <button
              type="button"
              disabled={!syncEnabled}
              onClick={saveMedicalInfo}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-medium text-white disabled:opacity-50"
            >
              <Icon name="save" className="h-4 w-4" />
              {t("translator.emergencyInfo.save")}
            </button>
            {saved && (
              <p className="text-center text-xs text-accent">{t("translator.emergencyInfo.saved")}</p>
            )}
            {saveError && (
              <p className="text-center text-xs text-red-500">{t("translator.emergencyInfo.saveError")}</p>
            )}

            <button
              type="button"
              onClick={() => jumpToPhrases("health")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-xs font-medium text-muted"
            >
              <Icon name="translate" className="h-3.5 w-3.5" />
              {t("translator.emergencyInfo.seeHealthLink")}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
