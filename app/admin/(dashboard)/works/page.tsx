import { Suspense } from "react";
import Link from "next/link";
import { listAllWorks } from "@/lib/admin-works";
import { togglePublished } from "@/lib/admin-actions";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import type { Work } from "@/lib/types";

export const metadata = { title: "Projects" };

function WorkRow({ work }: { work: Work }) {
  const published = work.published_at !== null;

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <Link
          href={`/admin/works/${work.id}`}
          className="block truncate tracking-wide hover:opacity-60"
        >
          {work.title}
        </Link>
        <p className="mt-1 truncate text-xs text-subtle">
          /{work.category}/{work.slug}
          {work.kind === "video" && " · video"}
          {work.kind === "video" && !work.external_url && (
            <span className="text-accent"> · no Drive link</span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span
          className={`text-xs uppercase tracking-widest ${
            published ? "text-subtle" : "text-accent"
          }`}
        >
          {published ? "Live" : "Draft"}
        </span>

        <form action={togglePublished}>
          <input type="hidden" name="id" value={work.id} />
          <input type="hidden" name="published" value={published ? "false" : "true"} />
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-1 text-xs uppercase tracking-widest hover:opacity-60"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        </form>
      </div>
    </li>
  );
}

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
            <ul className="divide-y divide-border rounded-lg border border-border">
              {inSection.map((work) => (
                <WorkRow key={work.id} work={work} />
              ))}
            </ul>
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

      <Suspense fallback={<p className="text-sm text-subtle">Loading…</p>}>
        <WorkList />
      </Suspense>
    </div>
  );
}
