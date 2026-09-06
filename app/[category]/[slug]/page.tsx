import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_META, isCategory } from "@/lib/categories";
import { getWork, listPublishedWorkPaths } from "@/lib/works";
import AssetGrid from "@/components/works/AssetGrid";

type Params = Promise<{ category: string; slug: string }>;

export async function generateStaticParams() {
  return listPublishedWorkPaths();
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isCategory(category)) return {};

  const work = await getWork(category, slug);
  if (!work) return {};

  return { title: work.title, description: work.description };
}

export default async function WorkPage({ params }: { params: Params }) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();

  const work = await getWork(category, slug);
  if (!work) notFound();

  return (
    <main className="flex flex-1 flex-col px-6 py-12 md:px-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/${category}`}
          aria-label={`Back to ${CATEGORY_META[category].title}`}
          className="rounded-full bg-surface p-2 text-fg transition-colors duration-300 hover:bg-surface-hover"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        <div>
          <h1 className="text-5xl font-light tracking-wide md:text-6xl">
            {work.title}
          </h1>
          <p className="mt-2 text-sm tracking-widest text-subtle">
            {work.description}
          </p>
        </div>
      </div>

      <AssetGrid assets={work.assets} />
    </main>
  );
}
