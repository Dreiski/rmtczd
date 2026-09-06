import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkForm from "@/components/admin/WorkForm";
import AssetManager from "@/components/admin/AssetManager";
import { getWorkById } from "@/lib/admin-works";
import { deleteWork } from "@/lib/admin-actions";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit project" };

async function EditForm({ params }: { params: Params }) {
  const { id } = await params;
  const work = await getWorkById(id);
  if (!work) notFound();

  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-light tracking-wide">{work.title}</h1>
        {work.published_at && (
          <Link
            href={`/${work.category}/${work.slug}`}
            className="shrink-0 text-xs uppercase tracking-widest text-subtle hover:opacity-60"
          >
            View on site
          </Link>
        )}
      </div>

      <WorkForm work={work} />

      <AssetManager work={work} />

      <div className="border-t border-border pt-6">
        <form action={deleteWork}>
          <input type="hidden" name="id" value={work.id} />
          <button
            type="submit"
            className="text-xs uppercase tracking-widest text-accent hover:opacity-60"
          >
            Delete this project
          </button>
        </form>
        <p className="mt-2 text-xs text-subtle">
          Deleting hides it from the site. It is kept in the database, so it can
          be brought back.
        </p>
      </div>
    </>
  );
}

export default function EditWorkPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link
        href="/admin/works"
        className="text-xs uppercase tracking-widest text-subtle hover:opacity-60"
      >
        ← Projects
      </Link>

      <Suspense fallback={<p className="text-sm text-subtle">Loading…</p>}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}
