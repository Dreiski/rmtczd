"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmUpload } from "@/lib/asset-actions";

/**
 * Three-step upload, once per file:
 *
 *   1. ask the server for an upload URL
 *   2. PUT the bytes straight to storage (never through a route handler, so
 *      Vercel's request body cap does not apply)
 *   3. confirm, which reads the dimensions off the decoded image and writes the
 *      assets row
 *
 * Files upload one at a time. The client's stated case is adding fifty images
 * at once, and fifty parallel PUTs from a laptop would starve each other and
 * make the progress display meaningless.
 */

interface Progress {
  name: string;
  status: "waiting" | "uploading" | "saving" | "done" | "error";
  error?: string;
}

async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  // createImageBitmap decodes off the main thread and avoids the object-URL
  // lifecycle an <img> would need.
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

export default function ImageUploader({ workId }: { workId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Progress[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  function update(index: number, patch: Partial<Progress>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  async function uploadOne(file: File, index: number): Promise<void> {
    update(index, { status: "uploading" });

    const signed = await fetch("/api/admin/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workId,
        contentType: file.type,
        size: file.size,
      }),
    });

    if (!signed.ok) {
      const { error } = await signed.json().catch(() => ({ error: "Upload failed." }));
      update(index, { status: "error", error });
      return;
    }

    const { uploadUrl, headers, storageKey } = await signed.json();

    let put: Response;
    try {
      put = await fetch(uploadUrl, { method: "PUT", headers, body: file });
    } catch {
      // fetch only rejects for network-level failures. Against a bucket the
      // overwhelmingly likely cause is a missing CORS rule: the browser blocks
      // the request before it is sent, and the error carries no detail. Without
      // this branch the row sat on "uploading…" forever.
      update(index, {
        status: "error",
        error: "Could not reach storage — check the bucket's CORS settings.",
      });
      return;
    }

    if (!put.ok) {
      update(index, { status: "error", error: `Upload failed (${put.status}).` });
      return;
    }

    update(index, { status: "saving" });

    let dimensions: { width: number; height: number };
    try {
      dimensions = await readDimensions(file);
    } catch {
      update(index, { status: "error", error: "That file is not a readable image." });
      return;
    }

    const result = await confirmUpload({
      workId,
      storageKey,
      width: dimensions.width,
      height: dimensions.height,
      // A filename is a poor alt text, but it beats an empty string and the
      // client can edit it below.
      alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    });

    update(
      index,
      result.ok ? { status: "done" } : { status: "error", error: result.error }
    );
  }

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setBusy(true);
    setItems(files.map((file) => ({ name: file.name, status: "waiting" })));

    try {
      for (const [index, file] of files.entries()) {
        try {
          await uploadOne(file, index);
        } catch (error) {
          // One bad file must not strand the rest of the queue.
          update(index, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed.",
          });
        }
      }
    } finally {
      // Always releases the picker, even if something threw above.
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }

    // Pull the new assets into the list rendered by the server component.
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-accent bg-surface" : "border-border"
        }`}
      >
        <p className="text-sm text-subtle">
          Drag images here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="underline hover:opacity-60 disabled:opacity-50"
          >
            choose files
          </button>
        </p>
        <p className="mt-2 text-xs text-subtle">
          JPEG, PNG, WebP or AVIF, up to 15MB each.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex justify-between gap-4">
              <span className="truncate text-subtle">{item.name}</span>
              <span
                className={
                  item.status === "error"
                    ? "shrink-0 text-accent"
                    : "shrink-0 text-subtle"
                }
              >
                {item.status === "waiting" && "waiting"}
                {item.status === "uploading" && "uploading…"}
                {item.status === "saving" && "saving…"}
                {item.status === "done" && "done"}
                {item.status === "error" && (item.error ?? "failed")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
