import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, CATEGORY_META, isCategory } from "@/lib/categories";
import { getWork, listPublishedWorkPaths } from "@/lib/works";
import { driveEmbedUrl, driveViewUrl } from "@/lib/drive";
import AssetGrid from "@/components/works/AssetGrid";
import VideoPlayer from "@/components/works/VideoPlayer";

type Params = Promise<{ category: string; slug: string }>;

export async function generateStaticParams() {
  const paths = await listPublishedWorkPaths();
  if (paths.length > 0) return paths;

  // Cache Components refuses to build when generateStaticParams returns
  // nothing, so an empty gallery would fail the deploy outright — which is
  // exactly the state a client can reach by unpublishing their last project, or
  // on a first deploy against an empty database. One unroutable param keeps the
  // build valid; the page below resolves it to notFound() like any other slug
  // with no work behind it.
  return [{ category: CATEGORIES[0], slug: "__no-published-works__" }];
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

  // The cover doubles as the video's poster frame; fall back to the first
  // snapshot so a video work is never fronted by an empty box.
  const coverAsset =
    work.assets.find((asset) => asset.id === work.cover_asset_id) ?? work.assets[0];
  const poster = coverAsset
    ? { url: coverAsset.url, alt: coverAsset.alt }
    : null;

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

      {/* §2: a video work plays on the site rather than bouncing the visitor
          to Drive. Snapshots below it are the stills, not the video. */}
      {work.kind === "video" && work.external_url && (
        <div className="mb-10">
          <VideoPlayer
            title={work.title}
            embedUrl={driveEmbedUrl(work.external_url)}
            viewUrl={driveViewUrl(work.external_url)}
            poster={poster}
          />
        </div>
      )}

      <AssetGrid assets={work.assets} />
    </main>
  );
}
