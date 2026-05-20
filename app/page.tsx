"use client";

import { useApp } from "./AppContext";
import Carousel from "@/components/sections/Carousel";

const IMAGES = [
  { id: 1, label: "Solitude I" },
  { id: 2, label: "Dusk Study" },
  { id: 3, label: "Still Life III" },
  { id: 4, label: "Golden Hour" },
  { id: 5, label: "After Rain" },
  { id: 6, label: "Reverie" },
  { id: 7, label: "Morning Fog" },
];

const NAV_LINKS = ["edits", "photographs", "pubs", "personal"];

export default function Home() {
  const { menuOpen, setMenuOpen, dark } = useApp();

  return (
    <div
      className={`flex-1 flex flex-col transition-colors duration-500 ${
        dark ? "bg-[#111111] text-[#f0ebe0]" : "bg-[#f9f5ee] text-[#1a1410]"
      }`}
      style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
    >


      {/* ── Main / Carousel ── */}
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <Carousel items={IMAGES} />
      </main>
    </div>
  );
}
  