import { Suspense } from "react";
import Link from "next/link";
import { listAllWorks } from "@/lib/admin-works";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import ReorderableWorkList from "@/components/admin/ReorderableWorkList";

export const metadata = { title: "Projects" };

async function WorkList() {
  const works = await listAllWorks();

  if (works.length === 0) {
    return (
      <p className="text-sm text-subtle">
        Nothing here yet. Add your first project.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {CATEGORIES.map((category) => {
        const inSection = works.filter((work) => work.category === category);
        if (inSection.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="mb-3 text-xs uppercase tracking-widest text-subtle">
              {CATEGORY_META[category].title}
            </h2>
            <ReorderableWorkList category={category} works={inSection} />
          </section>
        );
      })}
    </div>
  );
}

export default function WorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light tracking-wide">Projects</h1>
        <Link
          href="/admin/works/new"
          className="rounded-md bg-fg px-4 py-2 text-sm uppercase tracking-widest text-bg transition-opacity hover:opacity-80"
        >
          Add project
        </Link>
      </div>

      <p className="-mt-4 text-sm text-subtle">
        Drag a project by its handle to change where it appears on the site, or
        use the arrows. The order is saved as soon as you drop it.
      </p>

      <Suspense fallback={<p className="text-sm text-subtle">Loading…</p>}>
        <WorkList />
      </Suspense>
    </div>
  );
}
