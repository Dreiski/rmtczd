"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/app/AppContext";

const NAV_LINKS = ["edits", "photographs", "pubs", "personal"];

// ── Icons ──────────────────────────────────────────────────────────────────

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93"  y1="4.93"  x2="6.34"  y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="4.93"  y1="19.07" x2="6.34"  y2="17.66" />
      <line x1="17.66" y1="6.34"  x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2.2" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <path d="M12 13.5a2.5 2.5 0 0 1 5 0V16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6"  y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7"  x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────

export default function Header() {
  const { dark, setDark, menuOpen, setMenuOpen } = useApp();

  const borderColor  = dark ? "border-[#2a2a2a]"  : "border-[#e6dfd2]";
  const bgColor      = dark ? "bg-[#111111]"       : "bg-[#FFF9EF]";
  const fgColor      = dark ? "#f0ebe0"            : "#1a1410";
  const subtleColor  = dark ? "#555"               : "#b0a898";
  const sidebarBg    = dark ? "bg-[#111111]"       : "bg-[#f9f5ee]";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        .nav-btn {
          font-family: 'EB Garamond', serif;
          font-size: 0.875rem;
          letter-spacing: 0.08em;
          text-transform: lowercase;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-btn:hover { opacity: 0.45; }

        .social-btn {
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          line-height: 0;
          padding: 2px;
        }
        .social-btn:hover { opacity: 0.4; }

        .menu-item-btn {
          font-family: 'EB Garamond', serif;
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.04em;
          text-transform: lowercase;
          transition: opacity 0.2s;
          text-align: left;
          width: 100%;
        }
        .menu-item-btn:hover { opacity: 0.35; }

        .theme-btn {
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'EB Garamond', serif;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          padding: 4px 6px;
          border-radius: 4px;
        }
        .theme-btn:hover { opacity: 0.55; transform: scale(1.05); }

        /* Sidebar slide-in */
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .sidebar-anim  { animation: slideIn 0.28s cubic-bezier(.23,1,.32,1) both; }
        .overlay-anim  { animation: fadeInOverlay 0.25s ease both; }

        /* Mobile: hide email, show only icon-toggle */
        @media (max-width: 640px) {
          .hide-mobile  { display: none !important; }
          .show-mobile  { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile  { display: none !important; }
        }
      `}</style>

      <header
        className={`${bgColor} border-b ${borderColor} fade-up sticky top-0 z-30`}
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        <div className="flex items-center justify-between px-5 sm:px-10 py-2">

          {/* ── Logo ── */}
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

          {/* ── Desktop Nav ── */}
          <nav className="hide-mobile flex items-center gap-8">
            {/* Email */}
            <a
              href="mailto:romanticized@gmail.com"
              className="nav-btn"
              style={{ color: fgColor, textDecoration: "none" }}
            >
              romanticized@gmail.com
            </a>

            {/* Theme toggles */}
            <div className="flex items-center gap-1">
              <button
                className="theme-btn"
                style={{ color: !dark ? "#c0160c" : subtleColor }}
                onClick={() => setDark(false)}
                aria-label="Light mode"
              >
                <SunIcon size={15} />
                <span>light</span>
              </button>

              <span style={{ color: subtleColor, fontSize: "0.75rem" }}>|</span>

              <button
                className="theme-btn"
                style={{ color: dark ? "#c0160c" : subtleColor }}
                onClick={() => setDark(true)}
                aria-label="Dark mode"
              >
                <MoonIcon size={15} />
                <span>dark</span>
              </button>
            </div>

            {/* Menu button */}
            <button
              className="nav-btn"
              style={{ color: fgColor }}
              onClick={() => setMenuOpen(true)}
            >
              menu
            </button>
          </nav>

          {/* ── Mobile Nav ── */}
          <div className="show-mobile items-center gap-3">
            {/* Theme icon-only toggles on mobile */}
            <button
              className="theme-btn"
              style={{ color: !dark ? "#c0160c" : subtleColor }}
              onClick={() => setDark(false)}
              aria-label="Light mode"
            >
              <SunIcon size={18} />
            </button>
            <button
              className="theme-btn"
              style={{ color: dark ? "#c0160c" : subtleColor }}
              onClick={() => setDark(true)}
              aria-label="Dark mode"
            >
              <MoonIcon size={18} />
            </button>

            {/* Hamburger */}
            <button
              className="nav-btn"
              style={{ color: fgColor }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar Overlay ── */}
      {menuOpen && (
        <div
          className="overlay-anim fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          {/* Sidebar panel */}
          <div
            className={`sidebar-anim fixed left-0 top-0 h-full w-72 sm:w-80
              ${sidebarBg} border-r ${borderColor}
              flex flex-col p-8`}
            style={{ color: fgColor, fontFamily: "'EB Garamond', serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="self-end mb-8 nav-btn"
              style={{ color: subtleColor }}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <HamburgerIcon open={true} />
            </button>

            {/* Nav links */}
            <nav className="flex-1">
              <ul className="space-y-7">
                {NAV_LINKS.map((link) => (
                  <li key={link}>
                    <Link href={`/${link}`} onClick={() => setMenuOpen(false)}>
                      <button
                        className="menu-item-btn text-3xl sm:text-4xl"
                        style={{ color: fgColor }}
                      >
                        {link}
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sidebar footer */}
            <div className="space-y-5 pt-8 border-t" style={{ borderColor: dark ? "#2a2a2a" : "#e6dfd2" }}>
              {/* Mobile: show email here */}
              <a
                href="mailto:romanticized@gmail.com"
                className="show-mobile nav-btn text-sm"
                style={{ color: subtleColor, textDecoration: "none" }}
              >
                romanticized@gmail.com
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-4">
                <button className="social-btn" style={{ color: fgColor }} aria-label="Instagram">
                  <InstagramIcon />
                </button>
                <button className="social-btn" style={{ color: fgColor }} aria-label="LinkedIn">
                  <LinkedInIcon />
                </button>
                <button className="social-btn" style={{ color: fgColor }} aria-label="X">
                  <XIcon />
                </button>
              </div>

              <span className="text-xs tracking-wide block" style={{ color: subtleColor }}>
                © 2026 Romuald Samson.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}