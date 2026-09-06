import "server-only";
import { query } from "./db";
import { requireUser } from "./auth/dal";
import { CATEGORIES, type Category } from "./categories";

/**
 * Admin-side reads.
 *
 * Separate from lib/works.ts on purpose. That module is the public gallery: it
 * filters to published, non-deleted rows and caches under the `works` tag.
 * This one sees drafts, so it must never be cached under that tag — a cached
 * draft could otherwise be served to the public — and every function verifies
 * the session first, rather than trusting the caller to be behind the guard.
 */

export interface CategoryCounts {
  published: number;
  drafts: number;
}

export async function countWorksByCategory(): Promise<
  Record<Category, CategoryCounts>
> {
  await requireUser();

  const rows = await query<{
    category: Category;
    published: string | number;
    drafts: string | number;
  }>(
    `select category,
            count(*) filter (where published_at is not null) as published,
            count(*) filter (where published_at is null)     as drafts
       from works
      where deleted_at is null
      group by category`
  );

  const counts = Object.fromEntries(
    CATEGORIES.map((category) => [category, { published: 0, drafts: 0 }])
  ) as Record<Category, CategoryCounts>;

  for (const row of rows) {
    if (row.category in counts) {
      counts[row.category] = {
        published: Number(row.published),
        drafts: Number(row.drafts),
      };
    }
  }

  return counts;
}
