"use client";

import { motion } from "framer-motion";
import type { Asset } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

export default function AssetGrid({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <p className="text-sm tracking-widest uppercase text-subtle">
        No images in this project yet.
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
      {assets.map((asset) => (
        <motion.figure
          key={asset.id}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="group relative h-56 overflow-hidden rounded-lg bg-surface transition-all duration-300 hover:shadow-lg dark:bg-card dark:hover:shadow-xl"
        >
          {/* Placeholder until storage_key points at a real object in R2 and
              this becomes a next/image (step 4). */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-bg opacity-40 transition-opacity duration-300 group-hover:opacity-60" />

          <figcaption className="relative z-10 flex h-full flex-col justify-end p-6">
            <p className="text-sm leading-relaxed text-fg/70">{asset.alt}</p>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
