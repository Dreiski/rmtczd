/**
 * Loads placeholder content into an empty database.
 *
 *   npm run db:seed
 *
 * Idempotent and non-destructive: it skips any (category, slug) that already
 * exists, so re-running it will never clobber real work the client has added.
 * Pass --reset to wipe both tables first.
 */
import { CATEGORIES, COLLECTIONS } from "../db/seed-data.mjs";

const { query, close } = await import("../lib/db.ts");

const reset = process.argv.includes("--reset");

if (reset) {
  // assets cascade from works.
  await query("delete from works");
  console.log("Cleared works and assets.");
}

let created = 0;
let skipped = 0;

for (const category of CATEGORIES) {
  for (const [index, collection] of COLLECTIONS.entries()) {
    const existing = await query(
      "select id from works where category = $1 and slug = $2 and deleted_at is null",
      [category, collection.slug]
    );

    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    await query(
      `insert into works
         (slug, title, description, kind, year, category, sort_order, published_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())`,
      [
        collection.slug,
        collection.title,
        collection.description,
        // "edits" is treated as the videographer section, so those works
        // exercise the video card path. Confirm before this reaches the client.
        category === "edits" ? "video" : "photo",
        2026,
        category,
        index,
      ]
    );

    // No asset rows: an assets row describes a stored file, and there is no
    // file to describe until someone uploads one. Seeding empty rows produced
    // broken images on every work page (see migration 003).
    created += 1;
  }
}

console.log(`Seeded ${created} work(s), skipped ${skipped} already present.`);

await close();
