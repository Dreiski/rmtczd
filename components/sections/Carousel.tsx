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

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center px-5">
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
            className="flex w-full items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-card px-8 py-8 text-center text-fg shadow-2xl transition-colors duration-300"
            >
              <h2 className="mb-4 text-3xl font-light tracking-wide md:text-5xl">
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
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface p-2 text-fg md:left-6"
        >
          ←
        </motion.button>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface p-2 text-fg md:right-6"
        >
          →
        </motion.button>
      </div>

      <div className="absolute bottom-6 flex gap-3">
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
