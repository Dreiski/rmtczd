import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "./db";
import type { Category } from "./categories";
import type { Asset, Work, WorkWithAssets } from "./types";

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
  id, slug, title, description, kind, year, category,
  cover_asset_id, external_url, sort_order, published_at, deleted_at
`;

export async function listWorks(category: Category): Promise<Work[]> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  return query<Work>(
    `select ${WORK_COLUMNS}
       from works
      where category = $1 and ${PUBLIC_WHERE}
      order by sort_order, title`,
    [category]
  );
}

export async function getWork(
  category: Category,
  slug: string
): Promise<WorkWithAssets | null> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  const [work] = await query<Work>(
    `select ${WORK_COLUMNS}
       from works
      where category = $1 and slug = $2 and ${PUBLIC_WHERE}`,
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

  return { ...work, assets };
}

/** Drives generateStaticParams for /[category]/[slug]. */
export async function listPublishedWorkPaths(): Promise<
  { category: Category; slug: string }[]
> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  return query<{ category: Category; slug: string }>(
    `select category, slug from works where ${PUBLIC_WHERE} order by category, sort_order`
  );
}

/** Works surfaced on the home carousel, most curated first. */
export async function listFeaturedWorks(limit = 7): Promise<Work[]> {
  "use cache";
  cacheTag("works");
  cacheLife("max");

  return query<Work>(
    `select ${WORK_COLUMNS}
       from works
      where ${PUBLIC_WHERE}
      order by sort_order, category
      limit $1`,
    [limit]
  );
}
