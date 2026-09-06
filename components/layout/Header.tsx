"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/app/AppContext";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import {
  HamburgerIcon,
  InstagramIcon,
  LinkedInIcon,
  MoonIcon,
  SunIcon,
  XIcon,
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

      {/* ── Sidebar ── */}
      {menuOpen && (
        <div
          className="overlay-anim fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="sidebar-anim fixed left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-bg p-8 text-fg sm:w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="nav-btn self-end mb-8 text-subtle"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <HamburgerIcon open />
            </button>

            <nav className="flex-1">
              <ul className="space-y-7">
                {CATEGORIES.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/${category}`}
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-btn block text-3xl text-fg sm:text-4xl"
                    >
                      {CATEGORY_META[category].title.toLowerCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-5 border-t border-border pt-8">
              <a
                href={`mailto:${EMAIL}`}
                className="show-mobile nav-btn text-sm text-subtle no-underline"
              >
                {EMAIL}
              </a>

              {/* NOTE: unwired, as before this refactor. */}
              <div className="flex items-center gap-4">
                <button type="button" className="social-btn text-fg" aria-label="Instagram">
                  <InstagramIcon />
                </button>
                <button type="button" className="social-btn text-fg" aria-label="LinkedIn">
                  <LinkedInIcon />
                </button>
                <button type="button" className="social-btn text-fg" aria-label="X">
                  <XIcon />
                </button>
              </div>

              <span className="block text-xs tracking-wide text-subtle">
                © 2026 Romuald Samson.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
