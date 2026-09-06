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

function r2Config(): R2Config | null {
  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET: bucket,
    R2_PUBLIC_BASE_URL: publicBaseUrl,
  } = process.env;

  if (accountId && accessKeyId && secretAccessKey && bucket && publicBaseUrl) {
    return {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
    };
  }

  return null;
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

  // ContentType and ContentLength are signed, so the browser cannot upload a
  // different type or a larger file than the server authorised.
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: options.storageKey,
    ContentType: options.contentType,
    ContentLength: options.contentLength,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    headers: {
      "Content-Type": options.contentType,
      "Content-Length": String(options.contentLength),
    },
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
