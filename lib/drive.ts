/**
 * Google Drive link handling.
 *
 * §2 of docs/architecture.md: the client will paste whatever Drive gave them.
 * Normalise on save — extract the file ID, store only the ID, and build every
 * URL ourselves. Storing a pasted URL means storing Drive's UI quirks
 * (`?usp=drivesdk`, `/edit`, tracking params) forever.
 */

/**
 * Drive file IDs are URL-safe base64-ish. Modern ones are 33 characters, older
 * ones 28; the bound is loose on purpose rather than pinned to today's format.
 */
const FILE_ID = /^[A-Za-z0-9_-]{20,80}$/;

export type DriveParseResult =
  | { ok: true; fileId: string }
  | { ok: false; reason: string };

/**
 * Accepts any of the shapes Drive hands out, plus a bare ID:
 *
 *   https://drive.google.com/file/d/<id>/view?usp=drivesdk
 *   https://drive.google.com/file/d/<id>/preview
 *   https://drive.google.com/open?id=<id>
 *   https://drive.google.com/uc?export=download&id=<id>
 *   https://docs.google.com/document/d/<id>/edit
 *   <id>
 *
 * Folder links are rejected: a folder cannot be embedded as a single video, and
 * silently accepting one would produce a card that plays nothing.
 */
export function parseDriveLink(input: string): DriveParseResult {
  const value = input.trim();

  if (!value) return { ok: false, reason: "Paste the Google Drive link." };

  // Bare ID, pasted straight from a URL bar or another field.
  if (FILE_ID.test(value) && !value.includes("/")) {
    return { ok: true, fileId: value };
  }

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return { ok: false, reason: "That does not look like a Google Drive link." };
  }

  if (!/(^|\.)google\.com$/.test(url.hostname)) {
    return {
      ok: false,
      reason: "That is not a Google Drive link. Copy the link from Drive itself.",
    };
  }

  if (url.pathname.includes("/folders/")) {
    return {
      ok: false,
      reason:
        "That is a link to a folder. Open the individual video in Drive and copy its link instead.",
    };
  }

  // .../d/<id>/... — covers /file/d/, /document/d/, /presentation/d/ and friends.
  const fromPath = /\/d\/([A-Za-z0-9_-]+)/.exec(url.pathname)?.[1];
  if (fromPath && FILE_ID.test(fromPath)) {
    return { ok: true, fileId: fromPath };
  }

  // ?id=<id> — the /open and /uc shapes.
  const fromQuery = url.searchParams.get("id");
  if (fromQuery && FILE_ID.test(fromQuery)) {
    return { ok: true, fileId: fromQuery };
  }

  return {
    ok: false,
    reason: "Could not find a file ID in that link. Use Drive's “Copy link”.",
  };
}

/** Embeddable player URL. Works in an iframe; this is what the modal loads. */
export function driveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/** Human-facing URL, for the "Open in Drive" fallback inside the modal. */
export function driveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
