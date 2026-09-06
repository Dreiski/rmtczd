import Link from "next/link";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/layout/icons";

// No longer a Client Component: colours come from CSS variables rather than
// the theme context, so this renders entirely on the server.
//
// NOTE: the social buttons are still unwired, as they were before this
// refactor — they need real profile URLs.
export default function Footer() {
  return (
    <footer className="flex items-center justify-between bg-bg-chrome px-10 py-5">
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

      {/* The sidebar is the only other route into these sections and it only
          mounts when opened, so without these the category pages have no
          crawlable inbound link. */}
      <nav className="flex items-center gap-5">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/${category}`}
            className="text-xs lowercase tracking-widest text-subtle transition-opacity hover:opacity-60"
          >
            {CATEGORY_META[category].title}
          </Link>
        ))}
      </nav>

      <span className="text-xs tracking-wide text-subtle">
        © 2026 Romuald Samson.
      </span>
    </footer>
  );
}
