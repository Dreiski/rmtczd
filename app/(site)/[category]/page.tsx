import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, CATEGORY_META, isCategory } from "@/lib/categories";
import { listWorks } from "@/lib/works";
import WorkGrid from "@/components/works/WorkGrid";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};

  const meta = CATEGORY_META[category];
  return { title: meta.title, description: meta.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const meta = CATEGORY_META[category];
  const works = await listWorks(category);

  return (
    <main className="flex flex-1 flex-col px-6 py-12 md:px-12">
      <div className="mb-12">
        <h1 className="mb-4 text-5xl font-light tracking-wide md:text-6xl">
          {meta.title}
        </h1>
        <p className="text-sm uppercase tracking-widest text-subtle">{meta.blurb}</p>
      </div>

      <WorkGrid works={works} />
    </main>
  );
}
