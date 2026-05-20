"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/LOGO.jpg"
          alt="Splash Background"
          fill
          priority
          className="object-contain object-center"
        />
      </motion.div>

      {/* Center Content */}
      <div className="relative flex h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center text-white"
        >
        </motion.div>
      </div>
    </motion.div>
  );
}