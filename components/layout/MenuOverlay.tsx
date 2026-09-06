"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import SocialLinks from "@/components/layout/SocialLinks";

/**
 * The site menu.
 *
 * Behaves like a dialog rather than a div that happens to sit on top:
 * Escape closes it, the page behind does not scroll, focus moves in on open and
 * returns to the trigger on close, and Tab is kept inside while it is open.
 * Without those a keyboard user tabs straight through the panel into the page
 * behind it, which is still there and still focusable.
 */
export default function MenuOverlay({
  open,
  onClose,
  email,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 460, damping: 42 }}
            className="fixed left-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto border-r border-border bg-bg text-fg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-7 py-4">
              <span className="text-xs uppercase tracking-[0.2em] text-subtle">
                Menu
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="-mr-2 rounded-full p-2 text-subtle transition-opacity hover:opacity-60"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-7 py-6">
              <ul className="flex flex-col">
                {CATEGORIES.map((category) => {
                  const href = `/${category}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <li key={category}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className="group flex flex-col gap-1 border-b border-border/60 py-4 transition-opacity hover:opacity-60"
                      >
                        <span className="flex items-center gap-3 text-2xl font-light tracking-wide sm:text-3xl">
                          {/* Marks the current section without relying on colour
                              alone, which a red-green colourblind visitor would
                              miss. */}
                          <span
                            aria-hidden="true"
                            className={`h-px w-6 shrink-0 transition-all ${
                              active ? "bg-accent" : "w-3 bg-subtle/50"
                            }`}
                          />
                          {CATEGORY_META[category].title}
                        </span>
                        <span className="pl-9 text-xs text-subtle">
                          {CATEGORY_META[category].blurb}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex flex-col gap-4 border-t border-border px-7 py-6">
              <a
                href={`mailto:${email}`}
                className="text-sm text-fg no-underline transition-opacity hover:opacity-60"
              >
                {email}
              </a>

              <SocialLinks />

              <span className="text-xs tracking-wide text-subtle">
                © 2026 Romuald Samson.
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
