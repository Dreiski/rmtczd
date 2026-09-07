import Link from "next/link";
import Image from "next/image";
import { CATEGORY_META } from "@/lib/categories";
import type { CategoryPreview } from "@/lib/works";

/**
 * The home page: the four sections, as the way into the site.
 *
 * A server component with CSS-only hover. The cards are static and there is a
 * handful of them, so there is nothing here worth shipping a JavaScript
 * animation library for — the entry animation the work grids use would only
 * delay the first thing a visitor sees.
 */

/** Fallback tints for a section with no published image yet. */
const PLACEHOLDER_COLORS = ["#2a2a2a", "#c0160c", "#2d5016", "#8b6f47", "#404040"];

export default function CategoryGrid({
  previews,
}: {
  previews: CategoryPreview[];
}) {
  return (
    <ul className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2">
      {previews.map((preview, index) => {
        const meta = CATEGORY_META[preview.category];
        // An odd number of sections would leave the last card as a half-width
        // orphan, so it takes the full row instead.
        const spansRow =
          previews.length % 2 === 1 && index === previews.length - 1;

        return (
          <li key={preview.category} className={spansRow ? "sm:col-span-2" : undefined}>
            <Link
              href={`/${preview.category}`}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-lg p-6 transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-xl ${
                spansRow
                  ? "aspect-[16/10] sm:aspect-[21/7]"
                  : "aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10]"
              }`}
              style={
                preview.cover
                  ? undefined
                  : {
                      backgroundColor:
                        PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length],
                    }
              }
            >
              {preview.cover && (
                <Image
                  src={preview.cover.url}
                  alt=""
                  fill
                  // Two columns from the sm breakpoint up, one below it.
                  sizes={
                    spansRow
                      ? "(max-width: 640px) 100vw, 1240px"
                      : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 620px"
                  }
                  priority={index < 2}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}

              {/* Keeps the title legible over any photograph. */}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

              <span className="relative flex items-end justify-between gap-4">
                <span className="flex flex-col gap-1">
                  <span className="text-2xl font-light tracking-wide text-white md:text-3xl">
                    {meta.title}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-200">
                    {meta.blurb}
                  </span>
                </span>

                <span className="shrink-0 pb-1 text-xs uppercase tracking-widest text-gray-300">
                  {preview.count > 0
                    ? `${preview.count} ${preview.count === 1 ? "project" : "projects"}`
                    : "Coming soon"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
