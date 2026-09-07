"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/works", label: "Projects" },
];

function itemClass(active: boolean) {
  return `block rounded-md px-3 py-1.5 text-sm transition-colors ${
    active ? "bg-surface text-fg" : "text-subtle hover:bg-surface/60 hover:text-fg"
  }`;
}

/**
 * Admin navigation. Previously the only way to reach the projects list was a
 * button on the overview, so getting back meant the browser's back button.
 *
 * usePathname is a request-time API, so under Cache Components this has to sit
 * inside <Suspense> — hence the fallback below, which renders the same links
 * without the current-page highlight while the real one streams in. The nav is
 * therefore never missing from the shell, only briefly unhighlighted.
 */
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex items-center gap-1">
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminNavFallback() {
  return (
    <nav>
      <ul className="flex items-center gap-1">
        {LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={itemClass(false)}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
