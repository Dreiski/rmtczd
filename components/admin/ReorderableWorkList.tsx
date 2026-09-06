"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { saveWorkOrder, togglePublished } from "@/lib/admin-actions";
import type { Work } from "@/lib/types";
import DragHandle from "./DragHandle";

/**
 * Drag-to-reorder for one section.
 *
 * Order is saved when a drag ends rather than behind a "Save order" button: the
 * client is non-technical and an unsaved-changes state is one more thing to
 * explain. The list is optimistic, so it never snaps back while the write is in
 * flight.
 *
 * Dragging is not reachable by keyboard, so every row also has move up/down
 * buttons. They are the accessible path, not a fallback nobody uses.
 */

function WorkRow({
  work,
  index,
  total,
  onMove,
  onCommit,
}: {
  work: Work;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onCommit: () => void;
}) {
  const controls = useDragControls();
  const published = work.published_at !== null;

  return (
    <Reorder.Item
      value={work.id}
      dragListener={false}
      dragControls={controls}
      // onReorder fires continuously while dragging; the write waits for the
      // drop so a single drag is one request, not one per crossed row.
      onDragEnd={onCommit}
      className="flex items-center gap-3 bg-bg px-4 py-4"
    >
      <DragHandle
        onPointerDown={(event) => controls.start(event)}
        label={`Reorder ${work.title}`}
      />

      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          aria-label={`Move ${work.title} up`}
          className="px-1 text-xs text-subtle hover:opacity-60 disabled:opacity-25"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={index === total - 1}
          aria-label={`Move ${work.title} down`}
          className="px-1 text-xs text-subtle hover:opacity-60 disabled:opacity-25"
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/works/${work.id}`}
          className="block truncate tracking-wide hover:opacity-60"
        >
          {work.title}
        </Link>
        <p className="mt-1 truncate text-xs text-subtle">
          /{work.category}/{work.slug}
          {work.kind === "video" && " · video"}
          {work.kind === "video" && !work.external_url && (
            <span className="text-accent"> · no Drive link</span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span
          className={`text-xs uppercase tracking-widest ${
            published ? "text-subtle" : "text-accent"
          }`}
        >
          {published ? "Live" : "Draft"}
        </span>

        <form action={togglePublished}>
          <input type="hidden" name="id" value={work.id} />
          <input type="hidden" name="published" value={published ? "false" : "true"} />
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-1 text-xs uppercase tracking-widest hover:opacity-60"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        </form>
      </div>
    </Reorder.Item>
  );
}

export default function ReorderableWorkList({
  category,
  works,
}: {
  category: string;
  works: Work[];
}) {
  const [order, setOrder] = useState(() => works.map((work) => work.id));
  // onDragEnd fires from a child that closed over an older render, so read the
  // committed order from a ref rather than from that stale closure.
  const orderRef = useRef(order);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const byId = new Map(works.map((work) => [work.id, work]));

  // Re-sync when the server sends a different set (a work was added or deleted).
  const signature = works.map((work) => work.id).join(",");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current !== signature) {
      lastSignature.current = signature;
      setOrder(works.map((work) => work.id));
    }
  }, [signature, works]);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  async function persist(ids: string[]) {
    setStatus("saving");
    await saveWorkOrder(category, ids);
    setStatus("saved");
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
    void persist(next);
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        className="divide-y divide-border overflow-hidden rounded-lg border border-border"
      >
        {order.map((id, index) => {
          const work = byId.get(id);
          if (!work) return null;
          return (
            <WorkRow
              key={id}
              work={work}
              index={index}
              total={order.length}
              onMove={move}
              onCommit={() => void persist(orderRef.current)}
            />
          );
        })}
      </Reorder.Group>

      <p
        aria-live="polite"
        className="mt-2 h-4 text-right text-xs text-subtle"
        // The drag itself is the feedback; this line only confirms the write.
      >
        {status === "saving" && "Saving order…"}
        {status === "saved" && "Order saved"}
      </p>
    </>
  );
}
