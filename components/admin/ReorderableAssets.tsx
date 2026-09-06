"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { deleteAsset, makeCover, saveAltText } from "@/lib/asset-actions";
import { saveAssetOrder } from "@/lib/admin-actions";
import DragHandle from "./DragHandle";

/**
 * Drag-to-reorder for one work's images. Same contract as
 * ReorderableWorkList: optimistic, saved on drop, with arrow buttons as the
 * keyboard-reachable path.
 */

export interface AdminAsset {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

function AssetCard({
  asset,
  workId,
  isCover,
  index,
  total,
  onMove,
  onCommit,
}: {
  asset: AdminAsset;
  workId: string;
  isCover: boolean;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onCommit: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={asset.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-3"
    >
      <div className="flex items-center justify-between">
        <DragHandle
          onPointerDown={(event) => controls.start(event)}
          label={`Reorder ${asset.alt || "image"}`}
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            aria-label="Move image earlier"
            className="px-1 text-xs text-subtle hover:opacity-60 disabled:opacity-25"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            aria-label="Move image later"
            className="px-1 text-xs text-subtle hover:opacity-60 disabled:opacity-25"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="relative aspect-[3/2] overflow-hidden rounded bg-surface">
        <Image
          src={asset.url}
          alt={asset.alt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        {isCover && (
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white">
            Cover
          </span>
        )}
      </div>

      <form action={saveAltText} className="flex flex-col gap-2">
        <input type="hidden" name="workId" value={workId} />
        <input type="hidden" name="assetId" value={asset.id} />
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-subtle">
            Description (read aloud by screen readers)
          </span>
          <input
            name="alt"
            defaultValue={asset.alt}
            className="rounded border border-border bg-card px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          className="self-start text-[10px] uppercase tracking-widest text-subtle hover:opacity-60"
        >
          Save description
        </button>
      </form>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-subtle">
          {asset.width}×{asset.height}
        </span>

        <div className="flex items-center gap-4">
          {!isCover && (
            <form action={makeCover}>
              <input type="hidden" name="workId" value={workId} />
              <input type="hidden" name="assetId" value={asset.id} />
              <button
                type="submit"
                className="text-[10px] uppercase tracking-widest text-subtle hover:opacity-60"
              >
                Make cover
              </button>
            </form>
          )}

          <form action={deleteAsset}>
            <input type="hidden" name="workId" value={workId} />
            <input type="hidden" name="assetId" value={asset.id} />
            <button
              type="submit"
              className="text-[10px] uppercase tracking-widest text-accent hover:opacity-60"
            >
              Remove
            </button>
          </form>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function ReorderableAssets({
  workId,
  coverAssetId,
  assets,
}: {
  workId: string;
  coverAssetId: string | null;
  assets: AdminAsset[];
}) {
  const [order, setOrder] = useState(() => assets.map((asset) => asset.id));
  const orderRef = useRef(order);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const byId = new Map(assets.map((asset) => [asset.id, asset]));

  const signature = assets.map((asset) => asset.id).join(",");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current !== signature) {
      lastSignature.current = signature;
      setOrder(assets.map((asset) => asset.id));
    }
  }, [signature, assets]);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  async function persist(ids: string[]) {
    setStatus("saving");
    await saveAssetOrder(workId, ids);
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

  if (assets.length === 0) return null;

  return (
    <>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {order.map((id, index) => {
          const asset = byId.get(id);
          if (!asset) return null;
          return (
            <AssetCard
              key={id}
              asset={asset}
              workId={workId}
              isCover={coverAssetId === id}
              index={index}
              total={order.length}
              onMove={move}
              onCommit={() => void persist(orderRef.current)}
            />
          );
        })}
      </Reorder.Group>

      <p aria-live="polite" className="h-4 text-right text-xs text-subtle">
        {status === "saving" && "Saving order…"}
        {status === "saved" && "Order saved"}
      </p>
    </>
  );
}
