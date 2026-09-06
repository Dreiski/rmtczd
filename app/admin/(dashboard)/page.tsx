import { Suspense } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { countWorksByCategory } from "@/lib/admin-works";

async function CategoryCounts() {
  const counts = await countWorksByCategory();

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {CATEGORIES.map((category) => {
        const { published, drafts } = counts[category];
        return (
          <li key={category} className="flex items-center justify-between px-5 py-4">
            <Link href="/admin/works" className="tracking-wide hover:opacity-60">
              {CATEGORY_META[category].title}
            </Link>
            <span className="text-sm text-subtle">
              {published} published
              {drafts > 0 && `, ${drafts} draft${drafts === 1 ? "" : "s"}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function CountsSkeleton() {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {CATEGORIES.map((category) => (
        <li key={category} className="flex items-center justify-between px-5 py-4">
          <span className="tracking-wide">{CATEGORY_META[category].title}</span>
          <span className="text-sm text-subtle">…</span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminHome() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light tracking-wide">Your work</h1>
        <Link
          href="/admin/works"
          className="rounded-md bg-fg px-4 py-2 text-sm uppercase tracking-widest text-bg transition-opacity hover:opacity-80"
        >
          Manage projects
        </Link>
      </div>

      <Suspense fallback={<CountsSkeleton />}>
        <CategoryCounts />
      </Suspense>
    </div>
  );
}
