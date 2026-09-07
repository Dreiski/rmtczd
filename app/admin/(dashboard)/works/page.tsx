import { Suspense } from "react";
import Link from "next/link";
import { listAllWorks } from "@/lib/admin-works";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import ReorderableWorkList from "@/components/admin/ReorderableWorkList";
import { EmptyState, PageHeader, button } from "@/components/admin/ui";

export const metadata = { title: "Projects" };

async function WorkList() {
  const works = await listAllWorks();

  if (works.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Add your first project and it will appear here and on the site."
        action={
          <Link href="/admin/works/new" className={button.primary}>
            Add project
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {CATEGORIES.map((category) => {
        const inSection = works.filter((work) => work.category === category);
        const live = inSection.filter((w) => w.published_at !== null).length;

        return (
          <section key={category}>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium tracking-wide">
                {CATEGORY_META[category].title}
              </h2>
              <span className="text-xs text-subtle">
                {inSection.length === 0
                  ? "empty"
                  : `${live} live · ${inSection.length - live} draft`}
              </span>
            </div>

            {inSection.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-subtle">
                Nothing in this section yet.
              </p>
            ) : (
              <ReorderableWorkList category={category} works={inSection} />
            )}
          </section>
        );
      })}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}

export default function WorksPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Projects"
        description="Drag a project by its handle to change where it appears on the site, or use the arrows. The order saves as soon as you drop it."
        action={
          <Link href="/admin/works/new" className={button.primary}>
            Add project
          </Link>
        }
      />

      <Suspense fallback={<ListSkeleton />}>
        <WorkList />
      </Suspense>
    </div>
  );
}
