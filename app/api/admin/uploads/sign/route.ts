import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { getWorkById } from "@/lib/admin-works";
import {
  buildStorageKey,
  createPresignedUpload,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
} from "@/lib/storage";

/**
 * Issues a short-lived upload URL for one image.
 *
 * The browser sends only a description of the file; the storage key is built
 * here so a filename can never influence where the object lands. Content type
 * and length are part of the signature, so the upload the browser performs is
 * the one that was authorised.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { workId?: string; contentType?: string; size?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const { workId, contentType, size } = body;

  if (typeof workId !== "string" || typeof contentType !== "string" || typeof size !== "number") {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  if (!isAllowedImageType(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and AVIF images can be uploaded." },
      { status: 415 }
    );
  }

  if (!Number.isInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Images must be under ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.` },
      { status: 413 }
    );
  }

  // Confirms the work exists and is not soft-deleted before handing out a URL.
  const work = await getWorkById(workId);
  if (!work) {
    return NextResponse.json({ error: "That project no longer exists." }, { status: 404 });
  }

  const upload = await createPresignedUpload({
    storageKey: buildStorageKey(work.id, contentType),
    contentType,
    contentLength: size,
  });

  return NextResponse.json(upload);
}
