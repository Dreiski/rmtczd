"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Full-bleed splash overlay.
 *
 * LOGO.jpg is a 1500x1500 square on a solid #FFF9EF ground. Cropping that to a
 * 16:9 screen with object-cover discards nearly half its height, which is what
 * made it look zoomed in; on a tall phone it ate the sides instead.
 *
 * object-contain shows the whole image at every aspect ratio, and painting the
 * surround in the image's own background colour means the letterboxing is
 * invisible — the overlay still covers the viewport edge to edge, it just is not
 * all photograph. The colour is hardcoded rather than themed because it matches
 * the file, not the site: in dark mode a dark surround would frame the cream
 * square with a visible border.
 *
 * 100dvh tracks mobile browser chrome as it collapses, which 100vh does not —
 * on iOS Safari a vh-sized overlay leaves a gap once the toolbar hides.
 */
const IMAGE_BACKGROUND = "#FFF9EF";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: IMAGE_BACKGROUND,
      }}
      aria-hidden="true"
    >
      <motion.div
        // Barely there: enough to feel alive, not enough to read as a zoom.
        initial={{ scale: 1.03 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/LOGO.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-center"
        />
      </motion.div>
    </motion.div>
  );
}
