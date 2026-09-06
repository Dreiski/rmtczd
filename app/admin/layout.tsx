import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  // Nothing under /admin should ever appear in search results.
  robots: { index: false, follow: false },
};

// No auth check here: /admin/login lives under this layout too, and guarding it
// would loop. The guard sits in (dashboard)/layout.tsx, which covers every
// signed-in page.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col bg-bg text-fg">{children}</div>;
}
