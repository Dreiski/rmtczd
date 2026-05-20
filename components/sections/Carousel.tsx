"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/app/AppContext";

interface CarouselItem {
  id: number;
  label: string;
  image?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onItemChange?: (index: number) => void;
}

export default function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  onItemChange,
}: CarouselProps) {
  const { dark } = useApp();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, items.length]);

  useEffect(() => {
    onItemChange?.(current);
  }, [current, onItemChange]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  return (
  <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
    {/* Carousel Container */}
    <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center px-5">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="flex items-center justify-center w-full"
        >
          {/* Content Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className={`relative text-center w-full max-w-2xl transition-colors duration-300 ${
              dark
                ? "bg-[#1a1a1a] text-[#f0ebe0]"
                : "bg-white text-[#1a1410]"
            } rounded-2xl px-8 py-8 shadow-2xl`}
            style={{
              borderColor: dark ? "#2a2a2a" : "#e6dfd2",
              borderWidth: "1px",
            }}
          >
            {/* Label */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-3xl md:text-5xl font-light tracking-wide mb-4"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {items[current].label}
            </motion.h2>

            {/* Counter */}
            <div className="flex items-center justify-center gap-2">
              <div
                className="h-px flex-1 max-w-10"
                style={{
                  backgroundColor: dark ? "#555" : "#b0a898",
                }}
              />
              <span
                className="text-xs tracking-widest"
                style={{ color: dark ? "#555" : "#b0a898" }}
              >
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </span>
              <div
                className="h-px flex-1 max-w-10"
                style={{
                  backgroundColor: dark ? "#555" : "#b0a898",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Prev */}
      <motion.button
        onClick={handlePrev}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${
          dark
            ? "bg-[#2a2a2a] text-[#f0ebe0]"
            : "bg-[#e6dfd2] text-[#1a1410]"
        }`}
      >
        ←
      </motion.button>

      {/* Next */}
      <motion.button
        onClick={handleNext}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${
          dark
            ? "bg-[#2a2a2a] text-[#f0ebe0]"
            : "bg-[#e6dfd2] text-[#1a1410]"
        }`}
      >
        →
      </motion.button>
    </div>

    {/* Dots */}
    <div className="absolute bottom-6 flex gap-3">
      {items.map((_, index) => (
        <motion.button
          key={index}
          onClick={() => handleDotClick(index)}
          className={`transition-all duration-300 rounded-full ${
            index === current ? "w-10 h-2" : "w-2 h-2"
          } ${
            dark
              ? index === current
                ? "bg-[#f0ebe0]"
                : "bg-[#555]"
              : index === current
                ? "bg-[#1a1410]"
                : "bg-[#b0a898]"
          }`}
        />
      ))}
    </div>
  </div>
);
}
