"use client";

import type { PointerEvent } from "react";

/**
 * Grab handle for a reorderable row. The row itself is not drag-listening, so
 * links and buttons inside it stay clickable.
 *
 * aria-hidden on the glyph only; the button keeps a label because it is a real
 * control, even though keyboard users reorder with the arrow buttons instead.
 */
export default function DragHandle({
  onPointerDown,
  label,
}: {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      aria-label={label}
      title="Drag to reorder"
      className="shrink-0 cursor-grab touch-none px-1 text-subtle hover:opacity-60 active:cursor-grabbing"
    >
      <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
        <circle cx="4" cy="4" r="1.5" />
        <circle cx="10" cy="4" r="1.5" />
        <circle cx="4" cy="9" r="1.5" />
        <circle cx="10" cy="9" r="1.5" />
        <circle cx="4" cy="14" r="1.5" />
        <circle cx="10" cy="14" r="1.5" />
      </svg>
    </button>
  );
}
