import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";

/**
 * Admin shell.
 *
 * The layout itself is static; anything that reads the session sits inside a
 * <Suspense> boundary, which Cache Components requires so the shell can be
 * prerendered and the per-request parts streamed in.
 *
 * That means this layout is not the auth gate. Two things guard the admin:
 * proxy.ts turns away requests with no valid cookie before a route renders, and
 * every function in lib/admin-works.ts calls requireUser() itself. Verifying in
 * the data layer is what actually protects the data, rather than relying on a
 * layout that a future route might not sit under.
 */

async function AccountBar() {
  const user = await requireUser();

  return (
    <>
      <span className="text-xs text-subtle">{user.email}</span>
      <form action={logout}>
        <button
          type="submit"
          className="text-xs uppercase tracking-widest text-subtle hover:opacity-60"
        >
          Sign out
        </button>
      </form>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/admin" className="text-lg tracking-wide">
          Admin
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-subtle hover:opacity-60"
          >
            View site
          </Link>
          <Suspense fallback={null}>
            <AccountBar />
          </Suspense>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
