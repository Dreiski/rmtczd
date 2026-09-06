"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { WorkListItem } from "@/lib/works";

/**
 * Fallback card background for a work with no cover image yet. Indexed by
 * sort_order so the ordering the client curates drives the colour and it stays
 * stable across renders.
 */
const PLACEHOLDER_COLORS = [
  "#2a2a2a",
  "#c0160c",
  "#555555",
  "#2d5016",
  "#8b6f47",
  "#404040",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

function PlayGlyph() {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm ring-1 ring-white/30">
        <svg className="ml-0.5 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

export default function WorkGrid({ works }: { works: WorkListItem[] }) {
  if (works.length === 0) {
    return (
      <p className="text-sm tracking-widest uppercase text-subtle">
        Nothing published here yet.
      </p>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1"
    >
      {works.map((work) => (
        <motion.div key={work.id} variants={itemVariants} whileHover={{ y: -8 }}>
          <Link
            href={`/${work.category}/${work.slug}`}
            className="group relative block h-64 overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-xl"
            style={
              work.cover
                ? undefined
                : {
                    backgroundColor:
                      PLACEHOLDER_COLORS[
                        work.sort_order % PLACEHOLDER_COLORS.length
                      ],
                  }
            }
          >
            {work.cover && (
              <Image
                src={work.cover.url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}

            {/* Keeps the title legible over any photograph. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-75" />

            {/* §2: the video card gets a play glyph so nobody clicks expecting
                a lightbox. Only when there is a video to play — a glyph on a
                work whose Drive link is missing promises something the detail
                page cannot deliver. */}
            {work.kind === "video" && work.external_url && <PlayGlyph />}

            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h2 className="mb-2 text-2xl font-light tracking-wide text-white">
                {work.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-200">
                {work.description}
              </p>

              <span className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
