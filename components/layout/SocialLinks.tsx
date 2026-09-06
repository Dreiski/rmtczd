import { FacebookIcon, InstagramIcon } from "@/components/layout/icons";

/**
 * The site's social links, shared by the footer and the menu so the two cannot
 * drift apart.
 *
 * Real anchors rather than buttons: these navigate, and a button that navigates
 * cannot be opened in a new tab, copied, or reached the way a link can.
 */
const LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rom.anticized",
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Romanticized-films/61565670784129/",
    Icon: FacebookIcon,
  },
];

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-5 ${className}`}>
      {LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            // noreferrer alongside noopener: the destination has no business
            // knowing which page sent the visitor.
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className="social-btn block text-fg"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
