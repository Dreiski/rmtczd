import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Object storage for image assets.
 *
 * Two drivers, chosen by whether the R2 credentials are present:
 *
 *   - Cloudflare R2 via presigned PUT. §3 of docs/architecture.md called this
 *     optional at this scale, but the deploy target is Vercel, whose ~4.5MB
 *     serverless request body cap would break exactly the "add 50 images at
 *     once" case the doc uses to justify a custom admin. So the bytes go
 *     straight from the browser to the bucket and never touch a route handler.
 *   - The local filesystem under .uploads/, mirroring the PGlite fallback, so
 *     uploads work in development with nothing to provision.
 *
 * The browser follows the same three steps either way: ask for an upload URL,
 * PUT the bytes to it, then confirm.
 */

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function isAllowedImageType(value: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export interface PresignedUpload {
  uploadUrl: string;
  /** Headers the browser must send verbatim; they are part of the signature. */
  headers: Record<string, string>;
  storageKey: string;
}

/**
 * Keys are built here and never accepted from the client, so a filename cannot
 * escape its prefix or collide with another work's objects.
 */
export function buildStorageKey(workId: string, contentType: string): string {
  const ext = EXTENSIONS[contentType] ?? "bin";
  return `works/${workId}/${randomUUID()}.${ext}`;
}

/** Guards the confirm step: a key must belong to the work being edited. */
export function keyBelongsToWork(key: string, workId: string): boolean {
  return (
    key.startsWith(`works/${workId}/`) &&
    !key.includes("..") &&
    /^works\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i.test(key)
  );
}

// ── Driver selection ────────────────────────────────────────────────────────

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

const R2_VARS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL",
] as const;

function r2Config(): R2Config | null {
  const present = R2_VARS.filter((name) => Boolean(process.env[name]));

  // All or nothing. Falling back to local storage because one variable is
  // missing or misspelled looks like it works — uploads succeed, images render
  // — right up until the deploy, where the filesystem is ephemeral and the
  // images vanish. A half-configured bucket is a mistake, so say so.
  if (present.length > 0 && present.length < R2_VARS.length) {
    const missing = R2_VARS.filter((name) => !process.env[name]);
    throw new Error(
      `R2 is partly configured: ${missing.join(", ")} ${
        missing.length === 1 ? "is" : "are"
      } missing. Set all of ${R2_VARS.join(", ")}, or none of them to use local storage.`
    );
  }

  if (present.length === 0) return null;

  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "");

  let publicHost: string;
  try {
    publicHost = new URL(publicBaseUrl).hostname;
  } catch {
    throw new Error(
      `R2_PUBLIC_BASE_URL is not a valid URL: ${publicBaseUrl}. Use the bucket's public r2.dev URL or a custom domain, e.g. https://pub-<id>.r2.dev`
    );
  }

  // r2.cloudflarestorage.com is the S3 API endpoint. It only answers signed
  // requests, so images addressed there would 404 for every visitor — and the
  // upload half would keep working, making it look like a rendering bug.
  if (publicHost.endsWith(".r2.cloudflarestorage.com")) {
    throw new Error(
      `R2_PUBLIC_BASE_URL points at the S3 API endpoint (${publicHost}), which is not publicly readable. ` +
        "In the Cloudflare dashboard open the bucket, then Settings > Public access, and either enable the r2.dev subdomain " +
        "(https://pub-<id>.r2.dev) or connect a custom domain. Use that URL here."
    );
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
    publicBaseUrl,
  };
}

export function isUsingR2(): boolean {
  return r2Config() !== null;
}

async function s3Client(config: R2Config) {
  const { S3Client } = await import("@aws-sdk/client-s3");

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Recent SDK versions add a CRC32 checksum to every PutObject by default.
    // When presigning there is no body to checksum, so it signs the checksum of
    // an empty payload — and the upload then fails validation against the real
    // bytes. WHEN_REQUIRED leaves it out, which is what a presigned PUT needs.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function createPresignedUpload(options: {
  storageKey: string;
  contentType: string;
  contentLength: number;
}): Promise<PresignedUpload> {
  const config = r2Config();

  if (!config) {
    // Local driver: the "presigned" URL is a route handler that accepts the
    // same PUT. Same client code path, no credentials required.
    return {
      uploadUrl: `/api/admin/uploads/${options.storageKey}`,
      headers: { "Content-Type": options.contentType },
      storageKey: options.storageKey,
    };
  }

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const client = await s3Client(config);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: options.storageKey,
    ContentType: options.contentType,
    ContentLength: options.contentLength,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 300,
    // content-length is signed by default; content-type is not, and without it
    // the URL would accept a file of any type — including text/html, which a
    // public bucket would then serve back as a live document.
    signableHeaders: new Set(["content-type"]),
  });

  return {
    uploadUrl,
    // Content-Length is signed but deliberately not listed here: it is a
    // forbidden header name, so fetch() silently drops any value we set. The
    // browser sets it itself from the body, which is the value that was signed.
    headers: { "Content-Type": options.contentType },
    storageKey: options.storageKey,
  };
}

/** Confirms the object really landed before a row is written for it. */
export async function objectExists(storageKey: string): Promise<boolean> {
  const config = r2Config();

  if (!config) {
    const { stat } = await import("node:fs/promises");
    const { localPathFor } = await import("./storage-local");
    try {
      const info = await stat(localPathFor(storageKey));
      return info.isFile() && info.size > 0;
    } catch {
      return false;
    }
  }

  const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await s3Client(config);

  try {
    await client.send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: storageKey })
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(storageKey: string): Promise<void> {
  const config = r2Config();

  if (!config) {
    const { rm } = await import("node:fs/promises");
    const { localPathFor } = await import("./storage-local");
    await rm(localPathFor(storageKey), { force: true });
    return;
  }

  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await s3Client(config);

  await client.send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: storageKey })
  );
}

/** Where the browser reads the image from. */
export function publicUrlFor(storageKey: string): string {
  const config = r2Config();
  return config
    ? `${config.publicBaseUrl}/${storageKey}`
    : `/api/media/${storageKey}`;
}
