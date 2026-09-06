"use server";

import { updateTag } from "next/cache";
import { getWorkById } from "./admin-works";
import {
  addAsset,
  removeAsset,
  setCoverAsset,
  updateAssetAlt,
} from "./admin-assets";
import { deleteObject, keyBelongsToWork, objectExists } from "./storage";

/**
 * Mutations for images. Each ends with updateTag('works') so the public gallery
 * reflects the change immediately rather than serving a stale page.
 */

export interface ConfirmResult {
  ok: boolean;
  error?: string;
}

/**
 * Third step of an upload: the bytes are already in storage, so record them.
 *
 * Nothing here trusts the browser. The key must belong to the work being
 * edited, and the object must actually exist — otherwise a caller could create
 * asset rows pointing at objects that were never uploaded, or at another work's
 * images.
 */
export async function confirmUpload(input: {
  workId: string;
  storageKey: string;
  width: number;
  height: number;
  alt: string;
}): Promise<ConfirmResult> {
  const work = await getWorkById(input.workId);
  if (!work) return { ok: false, error: "That project no longer exists." };

  if (!keyBelongsToWork(input.storageKey, work.id)) {
    return { ok: false, error: "That file does not belong to this project." };
  }

  if (
    !Number.isInteger(input.width) ||
    !Number.isInteger(input.height) ||
    input.width <= 0 ||
    input.height <= 0 ||
    input.width > 20000 ||
    input.height > 20000
  ) {
    return { ok: false, error: "Could not read the image dimensions." };
  }

  if (!(await objectExists(input.storageKey))) {
    return { ok: false, error: "The upload did not complete. Try again." };
  }

  await addAsset({
    workId: work.id,
    storageKey: input.storageKey,
    width: input.width,
    height: input.height,
    alt: input.alt.slice(0, 300),
  });

  updateTag("works");
  return { ok: true };
}

export async function deleteAsset(formData: FormData): Promise<void> {
  const workId = String(formData.get("workId") ?? "");
  const assetId = String(formData.get("assetId") ?? "");

  const work = await getWorkById(workId);
  if (!work) return;

  const storageKey = await removeAsset(work.id, assetId);
  if (!storageKey) return;

  // The row is gone either way; a failure to remove the object leaves an
  // orphan in the bucket rather than a broken image on the site.
  try {
    await deleteObject(storageKey);
  } catch (error) {
    console.error("Failed to delete object", storageKey, error);
  }

  updateTag("works");
}

export async function makeCover(formData: FormData): Promise<void> {
  const workId = String(formData.get("workId") ?? "");
  const assetId = String(formData.get("assetId") ?? "");

  const work = await getWorkById(workId);
  if (!work) return;

  await setCoverAsset(work.id, assetId);
  updateTag("works");
}

export async function saveAltText(formData: FormData): Promise<void> {
  const workId = String(formData.get("workId") ?? "");
  const assetId = String(formData.get("assetId") ?? "");
  const alt = String(formData.get("alt") ?? "").slice(0, 300);

  const work = await getWorkById(workId);
  if (!work) return;

  await updateAssetAlt(work.id, assetId, alt);
  updateTag("works");
}
