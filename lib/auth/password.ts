import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with scrypt from node:crypto.
 *
 * scrypt is a memory-hard KDF built into Node, which means no native module to
 * compile and nothing extra to break on a serverless deploy — the usual pain
 * with bcrypt/argon2 bindings. Parameters are stored alongside the hash so they
 * can be raised later without invalidating existing passwords.
 *
 * Encoded as: scrypt$N$r$p$<salt base64>$<hash base64>
 */

// promisify() resolves to scrypt's 3-argument overload and drops the one that
// takes options, so the signature is restated here.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
) => Promise<Buffer>;

// N=2^15 costs roughly 100ms here. Raise N as hardware improves; old hashes
// keep verifying because their own cost is read back from the string.
const PARAMS = { N: 32768, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

// scrypt needs maxmem above roughly 128 * N * r; the default 32MB is too low.
const maxmem = (n: number, r: number) => 256 * n * r;

export async function hashPassword(password: string): Promise<string> {
  const { N, r, p } = PARAMS;
  const salt = randomBytes(SALT_BYTES);

  const derived = await scryptAsync(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N,
    r,
    p,
    maxmem: maxmem(N, r),
  });

  return [
    "scrypt",
    N,
    r,
    p,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string
): Promise<boolean> {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts;
  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }

  const salt = Buffer.from(rawSalt, "base64");
  const expected = Buffer.from(rawHash, "base64");

  let derived: Buffer;
  try {
    derived = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: maxmem(N, r),
    });
  } catch {
    return false;
  }

  // Lengths are equal by construction, but timingSafeEqual throws if they are
  // not, so guard rather than trust the stored string.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
