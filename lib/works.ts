import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "./db";
import { publicUrlFor } from "./storage";
import type { Category } from "./categories";
import type { Asset, Work } from "./types";

/** A work plus its resolved cover image, as rendered on a gallery card. */
export interface WorkListItem extends Work {
  cover: { url: string; width: number; height: number; alt: string } | null;
}

/** An asset with its public URL already resolved. */
export interface PublicAsset extends Asset {
  url: string;
}

/** A work and its ordered, URL-resolved images, as rendered on a detail page. */
export interface WorkDetail extends Work {
  assets: PublicAsset[];
}

interface CoverRow extends Work {
  cover_storage_key: string | null;
  cover_width: number | null;
  cover_height: number | null;
  cover_alt: string | null;
}

/**
 * Storage keys are an implementation detail, so URLs are resolved here rather
 * than in the client components that render the cards.
 */
function withCover(row: CoverRow): WorkListItem {
  const {
    cover_storage_key,
    cover_width,
    cover_height,
    cover_alt,
    ...work
  } = row;

  return {
    ...work,
    cover: cover_storage_key
      ? {
          url: publicUrlFor(cover_storage_key),
          width: cover_width ?? 1600,
          height: cover_height ?? 1067,
          alt: cover_alt ?? work.title,
        }
      : null,
  };
}

const COVER_JOIN = `
  left join assets cover on cover.id = works.cover_asset_id
`;

const COVER_COLUMNS = `
  cover.storage_key as cover_storage_key,
  cover.width       as cover_width,
  cover.height      as cover_height,
  cover.alt         as cover_alt
`;

/**
 * Read side of the public gallery.
 *
 * Every function here is cached under the `works` tag with a long lifetime, per
 * the guidance for CMS-shaped content: cache aggressively and invalidate on an
 * actual edit rather than expiring on a timer. The admin's publish action calls
 * updateTag('works') so the client sees their own change immediately.
 *
 * Public visibility is gated in SQL, not in the caller: a row is visible only
 * when it is published and not soft-deleted. Keeping that in one place is the
 * point of routing every read through this module.
 */

const PUBLIC_WHERE = "published_at is not null and deleted_at is null";

const WORK_COLUMNS = `
  works.id, works.slug, works.title, works.description, works.kind, works.year,
  works.category, works.cover_asset_id, works.external_url, works.sort_order,
  works.published_at, works.deleted_at
`;

export async function listWorks(category: Category): Promise<WorkListItem[]> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  const rows = await query<CoverRow>(
    `select ${WORK_COLUMNS}, ${COVER_COLUMNS}
       from works ${COVER_JOIN}
      where works.category = $1 and ${PUBLIC_WHERE}
      order by works.sort_order, works.title`,
    [category]
  );

  return rows.map(withCover);
}

export async function getWork(
  category: Category,
  slug: string
): Promise<WorkDetail | null> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  const [work] = await query<Work>(
    `select ${WORK_COLUMNS}
       from works
      where works.category = $1 and works.slug = $2 and ${PUBLIC_WHERE}`,
    [category, slug]
  );

  if (!work) return null;

  const assets = await query<Asset>(
    `select id, work_id, storage_key, width, height, alt, sort_order
       from assets
      where work_id = $1
      order by sort_order, id`,
    [work.id]
  );

  return {
    ...work,
    assets: assets.map((asset) => ({
      ...asset,
      url: publicUrlFor(asset.storage_key),
    })),
  };
}

/** Drives generateStaticParams for /[category]/[slug]. */
export async function listPublishedWorkPaths(): Promise<
  { category: Category; slug: string }[]
> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  return query<{ category: Category; slug: string }>(
    `select works.category, works.slug from works
      where ${PUBLIC_WHERE} order by works.category, works.sort_order`
  );
}

/** Works surfaced on the home carousel, most curated first. */
export async function listFeaturedWorks(limit = 7): Promise<WorkListItem[]> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  const rows = await query<CoverRow>(
    `select ${WORK_COLUMNS}, ${COVER_COLUMNS}
       from works ${COVER_JOIN}
      where ${PUBLIC_WHERE}
      order by works.sort_order, works.category
      limit $1`,
    [limit]
  );

  return rows.map(withCover);
}
