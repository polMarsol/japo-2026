import { useId } from "react";

// Silueta (Material Symbols "backpack", outlined) y versión sólida
// ("backpack-fill"), mismo viewBox 0 -960 960 960. La sólida se usa como
// clipPath para "llenar" la mochila de abajo hacia arriba según progress.
const BACKPACK_OUTLINE_D =
  "M220-80q-24.75 0-42.37-17.63Q160-115.25 160-140v-510q0-55 34-95.5t86-50.5v-84h100v80h200v-80h100v84q52 10 86 50.5t34 95.5v510q0 24.75-17.62 42.37Q764.75-80 740-80H220Zm0-60h520v-510q0-38-26-64t-64-26H310q-37.12 0-63.56 26Q220-688 220-650v510Zm400-190h60v-140H280v60h340v80ZM480-440Z";
const BACKPACK_FILL_D =
  "M220-80q-25 0-42.5-17.5T160-140v-510q0-55 34-95.5t86-50.5v-84h100v80h200v-80h100v84q52 10 86 50.5t34 95.5v510q0 25-17.5 42.5T740-80H220Zm400-250h60v-140H280v60h340v80Z";

// Franja vertical aproximada (dins del viewBox -960..0) que ocupa el cos de
// la motxilla, per fer pujar el nivell de "farciment" de forma natural.
const FILL_TOP = -880;
const FILL_BOTTOM = -60;

export function BackpackGauge({
  progress,
  className = "",
  fillClassName = "text-accent",
  emptyClassName = "text-muted/25",
}: {
  progress: number;
  className?: string;
  fillClassName?: string;
  emptyClassName?: string;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const clipId = useId();
  const height = FILL_BOTTOM - FILL_TOP;
  const fillHeight = height * pct;
  const fillY = FILL_BOTTOM - fillHeight;

  return (
    <svg viewBox="0 -960 960 960" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={BACKPACK_FILL_D} />
        </clipPath>
      </defs>
      <path d={BACKPACK_OUTLINE_D} fill="currentColor" className={emptyClassName} />
      {pct > 0 && (
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={fillY} width={960} height={fillHeight} fill="currentColor" className={fillClassName} />
        </g>
      )}
    </svg>
  );
}
