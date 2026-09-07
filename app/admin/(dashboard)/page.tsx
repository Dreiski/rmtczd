import { Suspense } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { countWorksByCategory } from "@/lib/admin-works";
import { PageHeader, button, card } from "@/components/admin/ui";

async function CategoryCounts() {
  const counts = await countWorksByCategory();
  const totals = Object.values(counts).reduce(
    (acc, c) => ({
      published: acc.published + c.published,
      drafts: acc.drafts + c.drafts,
    }),
    { published: 0, drafts: 0 }
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} px-5 py-4`}>
          <p className="text-2xl font-light">{totals.published}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-subtle">
            Live on the site
          </p>
        </div>
        <div className={`${card} px-5 py-4`}>
          <p className="text-2xl font-light">{totals.drafts}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-subtle">
            Drafts
          </p>
        </div>
      </div>

      <ul className={`divide-y divide-border ${card}`}>
        {CATEGORIES.map((category) => {
          const { published, drafts } = counts[category];
          return (
            <li key={category}>
              <Link
                href="/admin/works"
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface/60"
              >
                <span>
                  <span className="block tracking-wide">
                    {CATEGORY_META[category].title}
                  </span>
                  <span className="mt-0.5 block text-xs text-subtle">
                    {CATEGORY_META[category].blurb}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-subtle">
                  {published} live
                  {drafts > 0 && `, ${drafts} draft`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function CountsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-20 animate-pulse rounded-lg bg-surface" />
      <div className="h-64 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Your work"
        description="Everything on the site, by section. Drafts are only visible to you."
        action={
          <Link href="/admin/works/new" className={button.primary}>
            Add project
          </Link>
        }
      />

      <Suspense fallback={<CountsSkeleton />}>
        <CategoryCounts />
      </Suspense>
    </div>
  );
}
