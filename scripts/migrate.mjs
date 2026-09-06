/**
 * Applies db/migrations/*.sql in filename order, once each.
 *
 * Uses the same driver as the app (lib/db.ts), so migrations run against
 * whichever database DATABASE_URL points at — or the local PGlite database when
 * it is unset.
 *
 *   npm run db:migrate
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { query, exec, close } = await import("../lib/db.ts");

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "db",
  "migrations"
);

await query(`
  create table if not exists schema_migrations (
    name       text primary key,
    applied_at timestamptz not null default now()
  )
`);

const applied = new Set(
  (await query("select name from schema_migrations")).map((row) => row.name)
);

const files = (await readdir(MIGRATIONS_DIR))
  .filter((name) => name.endsWith(".sql"))
  .sort();

let count = 0;

for (const file of files) {
  if (applied.has(file)) {
    console.log(`- ${file} (already applied)`);
    continue;
  }

  const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");

  // exec(), not query(): migration files hold multiple statements.
  await exec(sql);
  await query("insert into schema_migrations (name) values ($1)", [file]);

  console.log(`✓ ${file}`);
  count += 1;
}

console.log(count === 0 ? "Nothing to apply." : `Applied ${count} migration(s).`);

await close();
