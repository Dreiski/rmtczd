"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Full-bleed splash overlay.
 *
 * `object-cover` rather than `object-contain`: contain letterboxes the logo,
 * leaving bare strips down the sides on wide screens and above and below on
 * tall phones. Cover fills every viewport and crops instead, with the image
 * centred so the subject survives the crop. The black ground underneath means
 * any moment before the image paints is still full-bleed rather than white.
 *
 * `100dvh` tracks mobile browser chrome as it collapses, which `100vh` does
 * not — on iOS Safari a `vh`-sized overlay leaves a gap once the toolbar hides.
 * `inset-0` on a fixed element already covers the viewport; the explicit height
 * is a belt-and-braces guard for browsers that resize the visual viewport
 * during the animation.
 */
export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      style={{ width: "100vw", height: "100dvh" }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ scale: 1.1 }}
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
          className="object-cover object-center"
        />
      </motion.div>
    </motion.div>
  );
}
