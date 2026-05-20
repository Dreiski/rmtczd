"use client";

import { useApp } from "@/app/AppContext";

export default function Footer() {
  const { dark } = useApp();
    
  return (
        <footer
          className={`flex items-center justify-between px-10 py-5 ${
            dark ? "bg-[#111111]" : "bg-[#FFF9EF]"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <button className="social-btn" style={{ color: dark ? "#f0ebe0" : "#1a1410" }} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
              </svg>
            </button>
   
            {/* LinkedIn */}
            <button className="social-btn" style={{ color: dark ? "#f0ebe0" : "#1a1410" }} aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="3"/>
                <line x1="8" y1="11" x2="8" y2="16"/>
                <line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2.2"/>
                <line x1="12" y1="16" x2="12" y2="11"/>
                <path d="M12 13.5a2.5 2.5 0 0 1 5 0V16"/>
              </svg>
            </button>
   
            {/* X / Twitter */}
            <button className="social-btn" style={{ color: dark ? "#f0ebe0" : "#1a1410" }} aria-label="X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
   
          <span
            className="text-xs tracking-wide"
            style={{ color: dark ? "#555" : "#b0a898" }}
          >
            © 2026 Romuald Samson.
          </span>
        </footer>
  );
}