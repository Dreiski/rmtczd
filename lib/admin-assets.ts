import "server-only";
import { query } from "./db";
import { requireUser } from "./auth/dal";
import type { Asset } from "./types";

/**
 * Asset reads and writes for the admin. Like lib/admin-works.ts, every function
 * verifies the session itself rather than trusting the caller's position in the
 * route tree.
 */

export async function listAssets(workId: string): Promise<Asset[]> {
  await requireUser();

  return query<Asset>(
    `select id, work_id, storage_key, width, height, alt, sort_order
       from assets
      where work_id = $1
      order by sort_order, id`,
    [workId]
  );
}

export async function addAsset(input: {
  workId: string;
  storageKey: string;
  width: number;
  height: number;
  alt: string;
}): Promise<string> {
  await requireUser();

  const [{ next }] = await query<{ next: number }>(
    "select coalesce(max(sort_order) + 1, 0) as next from assets where work_id = $1",
    [input.workId]
  );

  const [asset] = await query<{ id: string }>(
    `insert into assets (work_id, storage_key, width, height, alt, sort_order)
     values ($1, $2, $3, $4, $5, $6)
     returning id`,
    [
      input.workId,
      input.storageKey,
      input.width,
      input.height,
      input.alt,
      Number(next),
    ]
  );

  // The first image uploaded becomes the cover, so a work is never left without
  // one by accident. Changing it later is an explicit action.
  await query(
    "update works set cover_asset_id = $2, updated_at = now() where id = $1 and cover_asset_id is null",
    [input.workId, asset.id]
  );

  return asset.id;
}

/** Returns the storage key so the caller can remove the object too. */
export async function removeAsset(
  workId: string,
  assetId: string
): Promise<string | null> {
  await requireUser();

  const [asset] = await query<{ storage_key: string }>(
    "delete from assets where id = $1 and work_id = $2 returning storage_key",
    [assetId, workId]
  );

  if (!asset) return null;

  // works.cover_asset_id is ON DELETE SET NULL, so the cover is already cleared.
  // Promote the next image rather than leaving the work without a cover.
  await query(
    `update works
        set cover_asset_id = (
              select id from assets where work_id = $1 order by sort_order, id limit 1
            ),
            updated_at = now()
      where id = $1 and cover_asset_id is null`,
    [workId]
  );

  return asset.storage_key;
}

export async function setCoverAsset(
  workId: string,
  assetId: string
): Promise<void> {
  await requireUser();

  await query(
    `update works
        set cover_asset_id = $2, updated_at = now()
      where id = $1
        and exists (select 1 from assets where id = $2 and work_id = $1)`,
    [workId, assetId]
  );
}

export async function updateAssetAlt(
  workId: string,
  assetId: string,
  alt: string
): Promise<void> {
  await requireUser();

  await query("update assets set alt = $3 where id = $2 and work_id = $1", [
    workId,
    assetId,
    alt,
  ]);
}

/** Persists a curated order for one work's images. See reorderWorks. */
export async function reorderAssets(
  workId: string,
  orderedIds: string[]
): Promise<void> {
  await requireUser();

  const valid = orderedIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (valid.length === 0) return;

  await query(
    `update assets as a
        set sort_order = new_order.position
       from (
         select id, ordinality - 1 as position
           from unnest($2::uuid[]) with ordinality as t(id, ordinality)
       ) as new_order
      where a.id = new_order.id
        and a.work_id = $1`,
    [workId, valid]
  );
}
