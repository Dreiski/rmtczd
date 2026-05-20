"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/app/AppContext";

const EDIT_COLLECTIONS = [
  {
    id: 1,
    title: "Monochrome Series",
    description: "Black and white studies exploring light and shadow",
    slug: "monochrome-series",
    color: "#2a2a2a",
  },
  {
    id: 2,
    title: "Color Palette",
    description: "Vibrant explorations of color theory and composition",
    slug: "color-palette",
    color: "#c0160c",
  },
  {
    id: 3,
    title: "Urban Landscapes",
    description: "Architectural and cityscape edits",
    slug: "urban-landscapes",
    color: "#555555",
  },
  {
    id: 4,
    title: "Nature Refined",
    description: "Natural scenes with enhanced detail and clarity",
    slug: "nature-refined",
    color: "#2d5016",
  },
  {
    id: 5,
    title: "Vintage Aesthetics",
    description: "Modern photos edited with classic film aesthetics",
    slug: "vintage-aesthetics",
    color: "#8b6f47",
  },
  {
    id: 6,
    title: "Minimalist Concepts",
    description: "Simplified compositions focusing on essential elements",
    slug: "minimalist-concepts",
    color: "#404040",
  },
];

export default function Photographs() {
  const { dark } = useApp();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            Pubs
          </h1>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ color: dark ? "#555" : "#b0a898" }}
          >
            Curated collections of refined and enhanced photographs
          </p>
        </motion.div>

        {/* Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1"
        >
          {EDIT_COLLECTIONS.map((collection) => (
            <Link key={collection.id} href={`/pubs/${collection.slug}`}>
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`relative h-64 rounded-lg overflow-hidden cursor-pointer group transition-shadow duration-300 ${
                  dark ? "hover:shadow-xl" : "hover:shadow-lg"
                }`}
                style={{
                  backgroundColor: collection.color,
                  opacity: 0.9,
                }}
              >
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-light tracking-wide text-white mb-2">
                      {collection.title}
                    </h2>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {collection.description}
                    </p>
                  </motion.div>

                  {/* Arrow Icon */}
                  <motion.div
                    className="absolute top-4 right-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-6 h-6 text-white"
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
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </main>
    </div>
  );
}