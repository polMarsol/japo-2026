import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ETIQUETTE_CATEGORIES, ETIQUETTE_TIPS, type EtiquetteCategory } from "../data/etiquetteTips";
import { SwipeCard } from "../components/SwipeCard";
import { Icon } from "../components/Icon";

export function Etiqueta() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<EtiquetteCategory>(ETIQUETTE_CATEGORIES[0].id);
  const [index, setIndex] = useState(0);

  const tips = useMemo(() => ETIQUETTE_TIPS.filter((tip) => tip.category === category), [category]);
  const tip = tips[index];
  const categoryDef = ETIQUETTE_CATEGORIES.find((c) => c.id === category)!;

  function selectCategory(c: EtiquetteCategory) {
    setCategory(c);
    setIndex(0);
  }

  function next() {
    setIndex((i) => (i + 1) % tips.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + tips.length) % tips.length);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">{t("etiquette.title")}</h1>
        <p className="text-xs text-muted">{t("etiquette.subtitle")}</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {ETIQUETTE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCategory(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              category === c.id ? "bg-accent text-white" : "bg-chip text-chip-text"
            }`}
          >
            <Icon name={c.icon} className="h-3.5 w-3.5" />
            {t(`etiquette.categories.${c.id}`)}
          </button>
        ))}
      </div>

      {tip && (
        <div className="flex flex-col items-center gap-4">
          <SwipeCard onSwipeNext={next} onSwipePrev={prev} className="w-full max-w-sm cursor-grab active:cursor-grabbing">
            <div className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-line bg-surface p-6 shadow-lg">
              <div className="flex flex-col items-center gap-3 text-center">
                <Icon name={categoryDef.icon} className="h-12 w-12 text-accent" />
                <h2 className="text-lg font-semibold text-text">{t(`etiquette.tips.${tip.id}.title`)}</h2>
                <p className="text-sm leading-relaxed text-muted">{t(`etiquette.tips.${tip.id}.body`)}</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
                <Icon name="swipe" className="h-3.5 w-3.5" />
                {t("etiquette.swipeHint")}
              </div>
            </div>
          </SwipeCard>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
            >
              <Icon name="chevron_left" className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-muted">
              {index + 1} / {tips.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-chip-text active:opacity-80"
            >
              <Icon name="chevron_right" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
