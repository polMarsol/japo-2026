import type { DayNode } from "../lib/db";
import { useChecklist } from "../lib/checklist";
import { getPlacePhoto, photoUrl } from "../lib/photos";
import { Icon, type IconName } from "./Icon";
import {
  extractInlineLinks,
  groupKind,
  hasCurrencyMention,
  hasDurationMention,
  isChecklistItem,
  isGridSection,
  isRecommendationSection,
  isTimeMarker,
  isTipLine,
  isWarningSection,
  sectionIcon,
  stripChecklistMarker,
  type GroupKind,
} from "../lib/outline";

function LinkPill({ href }: { href: string }) {
  const isMap = /maps|goo\.gl/i.test(href);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text active:opacity-80"
    >
      <Icon name={isMap ? "location_on" : "open_in_new"} className="h-3.5 w-3.5" />
      {isMap ? "Maps" : ""}
    </a>
  );
}

function Badge({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-chip px-2.5 py-1 text-xs font-medium text-chip-text">
      <Icon name={icon} className="h-3.5 w-3.5 shrink-0 text-accent" />
      {text}
    </span>
  );
}

function TipCallout({ node }: { node: DayNode }) {
  const { clean, links } = extractInlineLinks(node.text);
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-sky-500/25 bg-sky-500/5 p-2.5 text-sm leading-relaxed text-sky-700 dark:text-sky-300">
      <Icon name="lightbulb" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1 whitespace-pre-line">{clean}</span>
      {links.map((href, i) => (
        <LinkPill key={i} href={href} />
      ))}
    </div>
  );
}

function CheckboxLine({ label }: { label: string }) {
  const { isChecked, toggle } = useChecklist();
  const checked = isChecked(label);
  return (
    <label className="flex items-start gap-2 text-sm leading-relaxed">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggle(label)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
      />
      <span className={checked ? "text-muted line-through" : "text-text"}>{label}</span>
    </label>
  );
}

function SightsChips({ children }: { children: DayNode[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {children.map((child, i) =>
        child.children.length === 0 && !child.link ? (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-xs text-chip-text"
          >
            <Icon name="location_on" className="h-3 w-3" />
            {child.text}
          </span>
        ) : (
          <OutlineNode key={i} node={child} depth={2} />
        ),
      )}
    </div>
  );
}

function StepsList({ children, depth }: { children: DayNode[]; depth: number }) {
  return (
    <ol className="mt-2 flex flex-col gap-2">
      {children.map((child, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
            {i + 1}
          </span>
          <div className="flex-1">
            <OutlineNode node={child} depth={depth + 1} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function ChildList({
  children,
  depth,
  kind = "plain",
}: {
  children: DayNode[];
  depth: number;
  kind?: GroupKind;
}) {
  if (children.length === 0) return null;

  if (kind === "check") {
    return (
      <ul className="mt-2 flex flex-col gap-2 border-l border-line pl-3">
        {children.map((child, i) => (
          <li key={i}>
            {isTipLine(child.text) ? (
              <OutlineNode node={child} depth={depth + 1} />
            ) : (
              <CheckboxLine label={child.text} />
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (kind === "sights") return <SightsChips children={children} />;
  if (kind === "steps") return <StepsList children={children} depth={depth} />;

  return (
    <ul className="mt-2 flex flex-col gap-2 border-l border-line pl-3">
      {children.map((child, i) => (
        <li key={i}>
          <OutlineNode node={child} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

function StatTile({ node }: { node: DayNode }) {
  const money = hasCurrencyMention(node.text);
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-chip px-2.5 py-2 text-sm text-chip-text">
      {money && <Icon name="payments" className="h-3.5 w-3.5 shrink-0 text-accent" />}
      <span>{node.text}</span>
    </div>
  );
}

function StatGrid({ children }: { children: DayNode[] }) {
  if (children.length === 0) return null;
  const tiles = children.filter((c) => c.children.length === 0 && c.text.length <= 30);
  const notes = children.filter((c) => !tiles.includes(c));
  return (
    <div className="mt-2 flex flex-col gap-2">
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((c, i) => (
            <StatTile key={i} node={c} />
          ))}
        </div>
      )}
      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          {notes.map((c, i) => (
            <OutlineNode key={i} node={c} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ node, depth }: { node: DayNode; depth: number }) {
  const [title, ...rest] = node.children;
  return (
    <div className="relative pl-6">
      <span className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-accent" />
      <span className="absolute left-[4.5px] top-3.5 bottom-0 w-px bg-line" />
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-semibold text-accent">{node.text}</span>
        {title && (
          <span className="flex flex-1 items-center justify-between gap-2 text-sm text-text">
            <span className="whitespace-pre-line">{title.text}</span>
            {title.link && <LinkPill href={title.link} />}
          </span>
        )}
      </div>
      {title && (
        <ChildList children={title.children} depth={depth} kind={groupKind(title.text)} />
      )}
      {rest.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2 border-l border-line pl-3">
          {rest.map((child, i) => (
            <li key={i}>
              <OutlineNode node={child} depth={depth + 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CollapsibleSection({
  node,
  depth,
  icon,
  tone,
}: {
  node: DayNode;
  depth: number;
  icon: "warning" | "lightbulb";
  tone: "warning" | "info";
}) {
  const toneClass =
    tone === "warning"
      ? "border-yellow-500/25 bg-yellow-500/5 text-yellow-600 dark:text-yellow-300"
      : "border-sky-500/25 bg-sky-500/5 text-sky-600 dark:text-sky-300";
  return (
    <details className={`rounded-xl border p-3 ${toneClass}`}>
      <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-medium">
        <Icon name={icon} className="h-4 w-4" />
        {node.text}
      </summary>
      <div className="mt-2 text-text/80">
        <ChildList children={node.children} depth={depth} kind={groupKind(node.text)} />
      </div>
    </details>
  );
}

export function OutlineNode({
  node,
  depth,
}: {
  node: DayNode;
  depth: number;
}) {
  if (isChecklistItem(node.text)) {
    return <CheckboxLine label={stripChecklistMarker(node.text)} />;
  }

  if (isTipLine(node.text)) {
    return <TipCallout node={node} />;
  }

  if (isTimeMarker(node.text) && node.children.length > 0) {
    return <TimelineItem node={node} depth={depth} />;
  }

  if (isWarningSection(node.text)) {
    return <CollapsibleSection node={node} depth={depth} icon="warning" tone="warning" />;
  }

  if (isRecommendationSection(node.text)) {
    return <CollapsibleSection node={node} depth={depth} icon="lightbulb" tone="info" />;
  }

  // Etiqueta pura sin contenido propio: se muestra como divisor discreto
  // en vez de tarjeta vacía (tras el regroupTree esto ya solo pasa con
  // alguna etiqueta suelta sin contenido asociado, p.ej. un subtítulo).
  if (node.children.length === 0 && !node.link && depth === 0) {
    return (
      <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted">
        {node.text}
      </p>
    );
  }

  if (depth === 0) {
    const icon = sectionIcon(node.text);
    const vehiclePhoto = icon === "directions_car" ? getPlacePhoto("__vehicle__") : undefined;
    return (
      <section className="rounded-xl border border-line bg-surface p-3">
        <h2 className="flex items-center justify-between gap-2 text-sm font-semibold text-accent">
          <span className="flex items-center gap-1.5">
            {icon && <Icon name={icon} className="h-4 w-4" />}
            {node.text}
          </span>
          {node.link && <LinkPill href={node.link} />}
        </h2>
        {vehiclePhoto && (
          <img
            src={photoUrl(vehiclePhoto)}
            alt=""
            loading="lazy"
            className="mt-2 h-32 w-full rounded-lg object-cover"
          />
        )}
        {isGridSection(node.text) ? (
          <StatGrid children={node.children} />
        ) : (
          <ChildList children={node.children} depth={depth} kind={groupKind(node.text)} />
        )}
      </section>
    );
  }

  const { clean, links: inlineLinks } = extractInlineLinks(node.text);
  const allLinks = node.link ? [node.link, ...inlineLinks] : inlineLinks;

  // La linea era solo una URL pegada como texto (sin nada mas que decir):
  // solo mostramos el boton, no la URL cruda.
  if (!clean && allLinks.length > 0) {
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          {allLinks.map((href, i) => (
            <LinkPill key={i} href={href} />
          ))}
        </div>
        <ChildList children={node.children} depth={depth} kind={groupKind(node.text)} />
      </div>
    );
  }

  if (hasCurrencyMention(clean) || hasDurationMention(clean)) {
    return (
      <div>
        <Badge icon={hasCurrencyMention(clean) ? "payments" : "schedule"} text={clean} />
        <ChildList children={node.children} depth={depth} kind={groupKind(node.text)} />
      </div>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 text-sm leading-relaxed text-text">
        <span className="flex-1 whitespace-pre-line">{clean}</span>
        {allLinks.map((href, i) => (
          <LinkPill key={i} href={href} />
        ))}
      </p>
      <ChildList children={node.children} depth={depth} kind={groupKind(node.text)} />
    </div>
  );
}
