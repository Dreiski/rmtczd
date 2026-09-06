import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

/**
 * Stateless session: a signed JWT in an httpOnly cookie.
 *
 * Nothing sensitive rides in the payload — just the user id and issue time — so
 * signing (JWS) rather than encryption (JWE) is enough. The cookie is the only
 * session store; there is no server-side session table to expire or clean up.
 */

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ALG = "HS256";

export interface SessionPayload {
  userId: string;
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;

  if (!value || value.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters. Generate one with: openssl rand -base64 32"
    );
  }

  return new TextEncoder().encode(value);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Lax still sends the cookie on a top-level navigation back to /admin,
    // while blocking it on cross-site form posts.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** Returns null for a missing, malformed, tampered, or expired cookie. */
export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

/**
 * Exported separately so proxy.ts can check the raw cookie it already has,
 * without going through next/headers.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    // Expired or invalid; treat both as simply not signed in.
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
