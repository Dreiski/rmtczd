"use client";

import Image from "next/image";
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

export interface GridAsset extends Asset {
  /** Resolved server-side: storage layout is not the client's business. */
  url: string;
}

export default function AssetGrid({ assets }: { assets: GridAsset[] }) {
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
      {assets.map((asset, index) => (
        <motion.figure
          key={asset.id}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-surface transition-all duration-300 hover:shadow-lg dark:bg-card dark:hover:shadow-xl"
        >
          <Image
            src={asset.url}
            alt={asset.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // The first row is usually above the fold; the rest lazy-load.
            priority={index < 3}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </motion.figure>
      ))}
    </motion.div>
  );
}
