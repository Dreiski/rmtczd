import "server-only";
import { query } from "./db";
import { requireUser } from "./auth/dal";
import { CATEGORIES, type Category } from "./categories";
import type { Work, WorkKind } from "./types";

/**
 * Admin-side reads and writes.
 *
 * Separate from lib/works.ts on purpose. That module is the public gallery: it
 * filters to published, non-deleted rows and caches under the `works` tag. This
 * one sees drafts, so it must never be cached under that tag — a cached draft
 * could otherwise be served to the public — and every function verifies the
 * session first, rather than trusting the caller to be behind the guard.
 */

export interface CategoryCounts {
  published: number;
  drafts: number;
}

export interface WorkInput {
  title: string;
  slug: string;
  description: string;
  category: Category;
  kind: WorkKind;
  year: number | null;
  /** Drive *file ID*, already extracted by lib/drive.ts. Null for photo works. */
  externalUrl: string | null;
  published: boolean;
}

const WORK_COLUMNS = `
  id, slug, title, description, kind, year, category,
  cover_asset_id, external_url, sort_order, published_at, deleted_at
`;

/** Postgres unique_violation. Surfaced as a field error rather than a crash. */
export const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === UNIQUE_VIOLATION
  );
}

export class SlugTakenError extends Error {
  constructor() {
    super("Another project in this section already uses that web address.");
    this.name = "SlugTakenError";
  }
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

/** Everything the client owns, drafts included. Soft-deleted rows stay hidden. */
export async function listAllWorks(): Promise<Work[]> {
  await requireUser();

  return query<Work>(
    `select ${WORK_COLUMNS}
       from works
      where deleted_at is null
      order by category, sort_order, title`
  );
}

export async function getWorkById(id: string): Promise<Work | null> {
  await requireUser();

  // A malformed uuid would otherwise raise a Postgres cast error rather than
  // simply not matching.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const [work] = await query<Work>(
    `select ${WORK_COLUMNS} from works where id = $1 and deleted_at is null`,
    [id]
  );

  return work ?? null;
}

export async function createWork(input: WorkInput): Promise<string> {
  await requireUser();

  // New work goes to the end of its section; step 5 makes the order draggable.
  const [{ next }] = await query<{ next: number }>(
    `select coalesce(max(sort_order) + 1, 0) as next
       from works where category = $1 and deleted_at is null`,
    [input.category]
  );

  try {
    const [row] = await query<{ id: string }>(
      `insert into works
         (slug, title, description, kind, year, category, external_url,
          sort_order, published_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning id`,
      [
        input.slug,
        input.title,
        input.description,
        input.kind,
        input.year,
        input.category,
        input.externalUrl,
        Number(next),
        input.published ? new Date().toISOString() : null,
      ]
    );
    return row.id;
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function updateWork(id: string, input: WorkInput): Promise<void> {
  await requireUser();

  try {
    await query(
      `update works
          set slug = $2,
              title = $3,
              description = $4,
              kind = $5,
              year = $6,
              category = $7,
              external_url = $8,
              -- Preserve the original publish date when it is already set, so
              -- editing a live project does not look like a fresh publish.
              published_at = case
                when $9::boolean and published_at is null then now()
                when $9::boolean then published_at
                else null
              end,
              updated_at = now()
        where id = $1 and deleted_at is null`,
      [
        id,
        input.slug,
        input.title,
        input.description,
        input.kind,
        input.year,
        input.category,
        input.externalUrl,
        input.published,
      ]
    );
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  await requireUser();

  await query(
    `update works
        set published_at = case
              when $2::boolean and published_at is null then now()
              when $2::boolean then published_at
              else null
            end,
            updated_at = now()
      where id = $1 and deleted_at is null`,
    [id, published]
  );
}

/**
 * Soft delete. The row stays put so a mistaken delete is recoverable, and the
 * partial unique index means its slug is immediately free for reuse.
 */
export async function softDeleteWork(id: string): Promise<void> {
  await requireUser();

  await query(
    "update works set deleted_at = now(), updated_at = now() where id = $1",
    [id]
  );
}
