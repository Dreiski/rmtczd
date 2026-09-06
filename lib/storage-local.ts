import "server-only";
import path from "node:path";

/**
 * Filesystem layout for the local storage driver.
 *
 * Split out from lib/storage.ts so the route handlers can resolve a path
 * without pulling in the S3 SDK.
 *
 * Not used when R2 is configured, and unusable on a serverless deploy anyway:
 * the filesystem there is ephemeral and per-instance.
 */

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? ".uploads");

/**
 * Resolves a storage key to an absolute path, refusing anything that escapes
 * the upload directory. Keys are server-generated, but this is the boundary
 * where a crafted request would arrive, so it re-checks rather than assumes.
 */
export function localPathFor(storageKey: string): string {
  const resolved = path.resolve(UPLOAD_DIR, storageKey);

  if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error("Refusing to resolve a storage key outside the upload directory");
  }

  return resolved;
}
