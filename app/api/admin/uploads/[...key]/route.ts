import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth/dal";
import { localPathFor } from "@/lib/storage-local";
import { isAllowedImageType, isUsingR2, MAX_UPLOAD_BYTES } from "@/lib/storage";

/**
 * Receiving end of the local storage driver: the development stand-in for a
 * presigned PUT straight to R2.
 *
 * Disabled whenever R2 is configured, so a deployed instance cannot be used to
 * write files onto its own (ephemeral, per-instance) filesystem.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (isUsingR2()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!isAllowedImageType(contentType)) {
    return NextResponse.json({ error: "Unsupported type." }, { status: 415 });
  }

  const { key } = await params;
  const storageKey = key.join("/");

  let target: string;
  try {
    target = localPathFor(storageKey);
  } catch {
    return NextResponse.json({ error: "Bad key." }, { status: 400 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Bad size." }, { status: 413 });
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);

  return new NextResponse(null, { status: 200 });
}
