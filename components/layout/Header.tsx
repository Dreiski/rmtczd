"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/app/AppContext";
import MenuOverlay from "@/components/layout/MenuOverlay";
import {
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@/components/layout/icons";

const EMAIL = "rom.anticized29@gmail.com";

export default function Header() {
  const { dark, setDark, menuOpen, setMenuOpen } = useApp();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-bg-chrome">
        <div className="flex items-center justify-between px-5 py-2 sm:px-10">
          <Link href="/" className="shrink-0">
            <Image
              src="/ROMANTICIZED LOGO.png"
              alt="Romanticized"
              width={150}
              height={60}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* ── Desktop ── */}
          <nav className="hide-mobile flex items-center gap-8">
            <a href={`mailto:${EMAIL}`} className="nav-btn text-fg no-underline">
              {EMAIL}
            </a>

            <div className="flex items-center gap-1">
              <button
                className={`theme-btn ${dark ? "text-subtle" : "text-accent"}`}
                onClick={() => setDark(false)}
                aria-label="Light mode"
                aria-pressed={!dark}
              >
                <SunIcon size={15} />
                <span>light</span>
              </button>

              <span className="text-xs text-subtle">|</span>

              <button
                className={`theme-btn ${dark ? "text-accent" : "text-subtle"}`}
                onClick={() => setDark(true)}
                aria-label="Dark mode"
                aria-pressed={dark}
              >
                <MoonIcon size={15} />
                <span>dark</span>
              </button>
            </div>

            <button className="nav-btn text-fg" onClick={() => setMenuOpen(true)}>
              menu
            </button>
          </nav>

          {/* ── Mobile ── */}
          <div className="show-mobile items-center gap-3">
            <button
              className={`theme-btn ${dark ? "text-subtle" : "text-accent"}`}
              onClick={() => setDark(false)}
              aria-label="Light mode"
              aria-pressed={!dark}
            >
              <SunIcon size={18} />
            </button>
            <button
              className={`theme-btn ${dark ? "text-accent" : "text-subtle"}`}
              onClick={() => setDark(true)}
              aria-label="Dark mode"
              aria-pressed={dark}
            >
              <MoonIcon size={18} />
            </button>

            <button
              className="nav-btn text-fg"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        email={EMAIL}
      />
    </>
  );
}
