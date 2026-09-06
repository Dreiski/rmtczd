"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface CarouselItem {
  id: string;
  label: string;
  href?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 1000 : -1000, opacity: 0 }),
  };

  const go = (next: number, dir: number) => {
    setDirection(dir);
    setCurrent(next);
  };

  const handleNext = () => go((current + 1) % items.length, 1);
  const handlePrev = () => go((current - 1 + items.length) % items.length, -1);

  const item = items[current];

  // Fills whatever the layout leaves rather than a whole viewport: h-screen sat
  // below a sticky header and above a footer, so the home page was always taller
  // than the screen and scrolled for no reason.
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden py-6">
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 sm:px-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 420, damping: 34 },
              opacity: { duration: 0.2 },
            }}
            className="flex w-full items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-card px-5 py-6 text-center text-fg shadow-2xl transition-colors duration-200 sm:px-8 sm:py-7"
            >
              <h2 className="mb-3 text-2xl font-light tracking-wide sm:text-3xl md:text-4xl">
                {item.href ? (
                  <Link href={item.href} className="hover:opacity-60">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </h2>

              <div className="flex items-center justify-center gap-2">
                <div className="h-px max-w-10 flex-1 bg-subtle" />
                <span className="text-xs tracking-widest text-subtle">
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </span>
                <div className="h-px max-w-10 flex-1 bg-subtle" />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={handlePrev}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface p-2 text-fg sm:left-2"
        >
          ←
        </motion.button>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface p-2 text-fg sm:right-2"
        >
          →
        </motion.button>
      </div>

      <div className="mt-5 flex gap-3">
        {items.map((entry, index) => (
          <button
            key={entry.id}
            onClick={() => go(index, index > current ? 1 : -1)}
            aria-label={`Go to ${entry.label}`}
            className={`rounded-full transition-all duration-300 ${
              index === current ? "h-2 w-10 bg-fg" : "h-2 w-2 bg-subtle"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
