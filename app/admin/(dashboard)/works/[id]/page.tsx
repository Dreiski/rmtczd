import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkForm from "@/components/admin/WorkForm";
import AssetManager from "@/components/admin/AssetManager";
import DeleteWorkButton from "@/components/admin/DeleteWorkButton";
import { getWorkById } from "@/lib/admin-works";
import { CATEGORY_META } from "@/lib/categories";
import { Badge, button } from "@/components/admin/ui";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit project" };

async function EditForm({ params }: { params: Params }) {
  const { id } = await params;
  const work = await getWorkById(id);
  if (!work) notFound();

  const published = work.published_at !== null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-light tracking-wide sm:text-3xl">
              {work.title}
            </h1>
            <Badge tone={published ? "live" : "draft"}>
              {published ? "Live" : "Draft"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-subtle">
            {CATEGORY_META[work.category].title} · /{work.category}/{work.slug}
          </p>
        </div>

        {published && (
          <Link
            href={`/${work.category}/${work.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button.secondary} shrink-0`}
          >
            View on site ↗
          </Link>
        )}
      </div>

      <WorkForm work={work} />

      <AssetManager work={work} />

      <div className="border-t border-border pt-8">
        <DeleteWorkButton workId={work.id} title={work.title} />
      </div>
    </>
  );
}

function EditSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-9 w-64 animate-pulse rounded bg-surface" />
      <div className="h-64 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}

export default function EditWorkPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/works" className={button.quiet}>
          ← Projects
        </Link>
      </div>

      <Suspense fallback={<EditSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}
