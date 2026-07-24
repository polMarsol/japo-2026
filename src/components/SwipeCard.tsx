import { useRef, useState, type PointerEvent, type ReactNode } from "react";

// Targeta arrossegable "estil Tinder" sense cap llibreria de gestos: es
// segueix el dit amb Pointer Events + translateX/rotate, i en amollar-la
// per sobre del llindar s'anima la sortida abans de canviar de contingut.
const THRESHOLD = 80;
const EXIT_DURATION = 180;

export function SwipeCard({
  onSwipeNext,
  onSwipePrev,
  className = "",
  children,
}: {
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  className?: string;
  children: ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dragging" | "exiting">("idle");
  const startX = useRef(0);
  const activePointer = useRef<number | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (phase === "exiting") return;
    activePointer.current = e.pointerId;
    startX.current = e.clientX;
    setPhase("dragging");
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId || phase !== "dragging") return;
    setDragX(e.clientX - startX.current);
  }

  function release(e: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId || phase !== "dragging") return;
    activePointer.current = null;

    if (dragX <= -THRESHOLD || dragX >= THRESHOLD) {
      const goingNext = dragX < 0;
      setPhase("exiting");
      setDragX(goingNext ? -window.innerWidth : window.innerWidth);
      window.setTimeout(() => {
        if (goingNext) onSwipeNext();
        else onSwipePrev();
        setPhase("idle");
        setDragX(0);
      }, EXIT_DURATION);
    } else {
      setPhase("idle");
      setDragX(0);
    }
  }

  const rotate = Math.max(-12, Math.min(12, dragX / 12));

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition:
          phase === "dragging" ? "none" : `transform ${EXIT_DURATION}ms ease, opacity ${EXIT_DURATION}ms ease`,
        opacity: phase === "exiting" ? 0 : 1,
        touchAction: "pan-y",
      }}
      className={`select-none ${className}`}
    >
      {children}
    </div>
  );
}
