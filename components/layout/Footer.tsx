import Link from "next/link";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/layout/icons";

// No longer a Client Component: colours come from CSS variables rather than
// the theme context, so this renders entirely on the server.
//
// NOTE: the social buttons are still unwired — they need real profile URLs.
export default function Footer() {
  return (
    // Three groups on one row only once there is room. Below that they stack
    // and centre; previously justify-between squeezed all three into a phone's
    // width, so the section links collided with the copyright.
    <footer className="flex flex-col items-center gap-5 bg-bg-chrome px-6 py-6 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-10 sm:py-5 sm:text-left">
      <div className="order-2 flex items-center gap-5 sm:order-1 sm:gap-4">
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
      <nav className="order-1 sm:order-2">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                href={`/${category}`}
                className="block py-1 text-xs lowercase tracking-widest text-subtle transition-opacity hover:opacity-60"
              >
                {CATEGORY_META[category].title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <span className="order-3 text-xs tracking-wide text-subtle">
        © 2026 Romuald Samson.
      </span>
    </footer>
  );
}
