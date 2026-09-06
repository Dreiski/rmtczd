# Romanticized

Portfolio site for a photographer/videographer, with a client-editable admin.
Architecture notes and the build order live in [docs/architecture.md](docs/architecture.md).

Next.js 16 (App Router, Cache Components), React 19, Tailwind v4, Postgres.

## Getting started

```bash
npm install
npm run db:migrate   # apply db/migrations/*.sql
npm run db:seed      # load placeholder content
npm run dev
```

No database setup is needed locally. With `DATABASE_URL` unset the app falls
back to [PGlite](https://pglite.dev) — Postgres compiled to WASM — storing data
in `.pglite/` (gitignored). To work against a real database instead, copy
`.env.example` to `.env.local` and set `DATABASE_URL` to a Neon connection
string; the migrate and seed scripts follow the same variable.

The fallback is refused when `VERCEL` is set, so a deploy missing its
`DATABASE_URL` fails loudly instead of serving an empty site.

## Database

| Command | Effect |
| --- | --- |
| `npm run db:migrate` | Applies pending migrations. Idempotent. |
| `npm run db:seed` | Adds placeholder works, skipping any that exist. Never overwrites. |
| `npm run db:reset` | Wipes `works` and `assets`, then re-seeds. |

Migrations are plain SQL in `db/migrations/`, applied in filename order and
tracked in a `schema_migrations` table.

Two schema decisions worth knowing, both from the architecture notes:

- **`published_at` gates public visibility.** Null means draft. Every public
  read goes through `lib/works.ts`, which filters in SQL.
- **`deleted_at` is a soft delete.** The unique index on `(category, slug)` is
  partial, so deleting a work frees its slug for reuse.

## Layout

```
app/[category]/            public gallery — one route serves all four sections
lib/works.ts               every public read, cached under the `works` tag
lib/db.ts                  Postgres driver (Neon in production, PGlite locally)
db/migrations/             plain SQL, applied in order
scripts/                   migrate and seed CLIs
```

Content is cached with `cacheLife('max')` and tagged `works`, so it is served
statically until an edit invalidates the tag rather than expiring on a timer.
