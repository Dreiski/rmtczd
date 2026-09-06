import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { query } from "../db";
import { readSession } from "./session";

/**
 * Data Access Layer for auth.
 *
 * Every protected page, Server Action and Route Handler calls one of these
 * rather than reading the cookie itself. proxy.ts also redirects unauthenticated
 * traffic away from /admin, but that check is optimistic — it only proves a
 * cookie was well-formed. These functions are the real gate, because they
 * confirm the user still exists in the database.
 *
 * `cache` memoises per render pass, so a layout and its page share one query.
 */

export interface AdminUser {
  id: string;
  email: string;
}

export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const [user] = await query<AdminUser>(
    "select id, email from users where id = $1",
    [session.userId]
  );

  // A valid signature is not enough: the row may have been deleted since.
  return user ?? null;
});

/** Redirects to the login page when not signed in. Use this to guard a page. */
export const requireUser = cache(async (): Promise<AdminUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
});
