import SiteChrome from "@/components/layout/SiteChrome";

// Public site chrome: header, footer, splash. Scoped to this route group so the
// admin does not inherit a three-second splash screen on every navigation.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
