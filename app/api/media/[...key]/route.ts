import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { localPathFor } from "@/lib/storage-local";
import { isUsingR2 } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Serves images from the local storage driver. Public by design — these are the
 * portfolio images. In production R2 serves them directly and this returns 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (isUsingR2()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { key } = await params;
  const storageKey = key.join("/");

  let target: string;
  try {
    target = localPathFor(storageKey);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let size: number;
  try {
    const info = await stat(target);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ext = storageKey.split(".").pop()?.toLowerCase() ?? "";
  const stream = Readable.toWeb(
    createReadStream(target)
  ) as unknown as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(size),
      // Keys are content-addressed by uuid, so a key's bytes never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
