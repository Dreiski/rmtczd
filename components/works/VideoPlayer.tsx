"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/**
 * On-site player for a Drive-hosted video.
 *
 * §2 of docs/architecture.md: embed rather than redirect. Drive's /preview URL
 * works in an iframe, so the visitor stays on the site instead of being bounced
 * to Drive. The "Open in Drive" link stays inside the modal as the fallback,
 * because a sharing-permission change breaks the embed silently and there is no
 * cross-origin way to detect it — the visitor needs an obvious escape hatch.
 *
 * The iframe is only mounted while the modal is open, so Drive is never
 * contacted on page load.
 */
export default function VideoPlayer({
  title,
  embedUrl,
  viewUrl,
  poster,
}: {
  title: string;
  embedUrl: string;
  viewUrl: string;
  poster: { url: string; alt: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    // Captured now: the cleanup runs after this effect's render, and the rule
    // is right that a ref read there is not guaranteed to be the same node.
    const trigger = triggerRef.current;

    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Send focus back where it came from, rather than to the top of the page.
      trigger?.focus();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Play ${title}`}
        className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-surface"
      >
        {poster ? (
          <Image
            src={poster.url}
            alt={poster.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-surface-hover to-bg" />
        )}

        <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/35" />

        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <svg className="ml-1 h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex w-full max-w-5xl flex-col gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 text-white">
                <h2 className="truncate text-lg font-light tracking-wide">{title}</h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close video"
                  className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-60"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={embedUrl}
                  title={title}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>

              <p className="text-xs text-white/60">
                Not playing?{" "}
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  Open in Google Drive
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
