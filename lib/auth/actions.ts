"use server";

import { redirect } from "next/navigation";
import { query } from "../db";
import { verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export interface LoginState {
  error?: string;
}

interface UserRow {
  id: string;
  password_hash: string;
}

// A real scrypt hash of a random value, used only to equalise timing on the
// "no such user" path. It cannot match any password a user can type.
const DUMMY_HASH =
  "scrypt$32768$8$1$YWJjZGVmZ2hpamtsbW5vcA==$" +
  "gJ0kx1nB0Zx8zvQ9nZ2Xk8pKQ0m5r3wYy1sL6tHn4dEeR7uV2cA5bN8fM3jP0qXwZgTyU6iO1lC4vB9sD2aE7g==";

/**
 * Server Actions are POST-only and origin-checked by Next, so this form does not
 * need extra CSRF plumbing.
 *
 * Not rate limited. For a single-user admin behind an unguessable password that
 * is an accepted risk, but it is the obvious next hardening step — and it needs
 * shared state (Upstash, or a table) to work across serverless instances.
 */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const [user] = await query<UserRow>(
    "select id, password_hash from users where lower(email) = lower($1)",
    [email]
  );

  // Hash even when no row matched, so response time does not reveal whether the
  // address exists.
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !ok) {
    return { error: "That email and password do not match." };
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
