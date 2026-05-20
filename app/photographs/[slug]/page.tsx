"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/app/AppContext";

interface PhotoItem {
  id: number;
  title: string;
  description: string;
}

// Mock data for different collections
const COLLECTION_DATA: Record<string, { title: string; description: string; photos: PhotoItem[] }> = {
  "monochrome-series": {
    title: "Monochrome Series",
    description: "Black and white studies exploring light and shadow",
    photos: [
      { id: 1, title: "Urban Shadows", description: "City architecture in monochrome" },
      { id: 2, title: "Morning Light", description: "Early daylight through windows" },
      { id: 3, title: "Contrast Study", description: "High contrast black and white" },
      { id: 4, title: "Textures", description: "Surface details and patterns" },
      { id: 5, title: "Silhouettes", description: "Backlit figure studies" },
      { id: 6, title: "Details", description: "Close-up monochrome photography" },
    ],
  },
  "color-palette": {
    title: "Color Palette",
    description: "Vibrant explorations of color theory and composition",
    photos: [
      { id: 1, title: "Warm Tones", description: "Golden hour color grading" },
      { id: 2, title: "Cool Blues", description: "Blue hour compositions" },
      { id: 3, title: "Complementary", description: "Opposite color harmony" },
      { id: 4, title: "Saturation", description: "Enhanced color vibrancy" },
      { id: 5, title: "Pastels", description: "Soft, muted color palettes" },
      { id: 6, title: "Neon Lights", description: "Vibrant artificial lighting" },
    ],
  },
  "urban-landscapes": {
    title: "Urban Landscapes",
    description: "Architectural and cityscape edits",
    photos: [
      { id: 1, title: "Downtown", description: "City center architecture" },
      { id: 2, title: "Skyline", description: "Urban horizon at dusk" },
      { id: 3, title: "Streets", description: "Street-level compositions" },
      { id: 4, title: "Structures", description: "Modern building designs" },
      { id: 5, title: "Perspectives", description: "Geometric urban angles" },
      { id: 6, title: "Night City", description: "Urban nightscape views" },
    ],
  },
  "nature-refined": {
    title: "Nature Refined",
    description: "Natural scenes with enhanced detail and clarity",
    photos: [
      { id: 1, title: "Landscapes", description: "Scenic mountain views" },
      { id: 2, title: "Flora", description: "Detailed plant photography" },
      { id: 3, title: "Fauna", description: "Wildlife enhanced details" },
      { id: 4, title: "Waterscapes", description: "Water and reflections" },
      { id: 5, title: "Skies", description: "Cloud formations and sunsets" },
      { id: 6, title: "Seasons", description: "Seasonal nature studies" },
    ],
  },
  "vintage-aesthetics": {
    title: "Vintage Aesthetics",
    description: "Modern photos edited with classic film aesthetics",
    photos: [
      { id: 1, title: "Film Stock", description: "Classic film emulation" },
      { id: 2, title: "Grain", description: "Grain and texture effects" },
      { id: 3, title: "Color Shift", description: "Aged color grading" },
      { id: 4, title: "Faded", description: "Faded vintage look" },
      { id: 5, title: "Retro Glow", description: "Warm vintage tones" },
      { id: 6, title: "Classic", description: "Timeless classic edit style" },
    ],
  },
  "minimalist-concepts": {
    title: "Minimalist Concepts",
    description: "Simplified compositions focusing on essential elements",
    photos: [
      { id: 1, title: "Negative Space", description: "Minimalist compositions" },
      { id: 2, title: "Single Subject", description: "Focused on one element" },
      { id: 3, title: "Clean Lines", description: "Geometric minimalism" },
      { id: 4, title: "Empty Spaces", description: "Sparse and serene" },
      { id: 5, title: "Monolithic", description: "Large single subjects" },
      { id: 6, title: "Essential", description: "Core elements only" },
    ],
  },
};

export default function EditDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { dark } = useApp();

  const collection = COLLECTION_DATA[slug];

  if (!collection) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center transition-colors duration-500 ${
          dark ? "bg-[#111111] text-[#f0ebe0]" : "bg-[#f9f5ee] text-[#1a1410]"
        }`}
      >
        <h1 className="text-3xl font-light mb-4">Collection not found</h1>
        <Link
          href="/photographs"
          className="text-sm tracking-widest uppercase hover:underline"
        >
          Back to Photographs
        </Link>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <div
      className={`flex-1 flex flex-col transition-colors duration-500 ${
        dark ? "bg-[#111111] text-[#f0ebe0]" : "bg-[#f9f5ee] text-[#1a1410]"
      }`}
      style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
    >
      <main className="flex-1 flex flex-col px-6 md:px-12 py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/photographs">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full transition-colors duration-300 ${
                dark
                  ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#f0ebe0]"
                  : "bg-[#e6dfd2] hover:bg-[#d6cfbc] text-[#1a1410]"
              }`}
              aria-label="Back"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-light tracking-wide">
              {collection.title}
            </h1>
            <p
              className="text-sm tracking-widest mt-2"
              style={{ color: dark ? "#555" : "#b0a898" }}
            >
              {collection.description}
            </p>
          </motion.div>
        </div>

        {/* Photos Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1"
        >
          {collection.photos.map((photo) => (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className={`relative h-56 rounded-lg overflow-hidden group transition-all duration-300 ${
                dark ? "bg-[#1e1e1e] hover:shadow-xl" : "bg-[#e6dfd2] hover:shadow-lg"
              }`}
            >
              {/* Placeholder Image Background */}
              <div
                className="absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${
                    dark ? "#2a2a2a" : "#d6cfbc"
                  }, ${dark ? "#111111" : "#f9f5ee"})`,
                }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-light tracking-wide mb-2">
                    {photo.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: dark ? "#aaa" : "#666" }}
                  >
                    {photo.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
