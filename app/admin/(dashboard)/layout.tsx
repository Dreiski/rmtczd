import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";
import AdminNav, { AdminNavFallback } from "@/components/admin/AdminNav";
import { button } from "@/components/admin/ui";

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
    <div className="flex items-center gap-4">
      <span className="hidden text-xs text-subtle sm:inline">{user.email}</span>
      <form action={logout}>
        <button type="submit" className={button.quiet}>
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-bg-chrome">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium uppercase tracking-[0.2em]"
            >
              Romanticized
            </Link>
            <Suspense fallback={<AdminNavFallback />}>
              <AdminNav />
            </Suspense>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={button.quiet}
            >
              View site ↗
            </Link>
            <Suspense fallback={null}>
              <AccountBar />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
