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
in `.pglite/` (gitignored).

The fallback is refused when `VERCEL` is set, so a deploy missing its
`DATABASE_URL` fails loudly instead of serving an empty site.

> **One PGlite process at a time.** PGlite loads the database into memory when a
> process connects, so a second process sees a snapshot from its own connect
> time and never sees the first one's later writes. Stop `next dev` before
> running `db:migrate`, `db:seed` or `admin:password`, or they will appear to do
> nothing. This does not apply once `DATABASE_URL` points at Neon.

### Pointing at a real database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy its connection
   string. Use the **pooled** one (its host contains `-pooler`).
2. Put it in `.env.local`:

   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

3. Apply the schema and content to it:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

`.env.local` is gitignored, and the `db:*` scripts load it the same way `next
dev` does — so both the app and the CLIs always talk to the same database.
Watch for `[db] DATABASE_URL not set` in the output: that means the variable
did not reach the process and you are working against local PGlite.

For deployment, set `DATABASE_URL` in the Vercel project's environment
variables, then run `npm run db:migrate` once against that database.

## Admin

The admin lives at `/admin`, behind a single account. There is one user and
there will only ever be one — no sign-up, no roles, no user management.

Create or rotate the account:

```bash
npm run admin:password -- you@example.com
```

It prompts for the password without echoing it, and can be re-run any time to
change the password or the email. The hash lives in the database, so rotating it
needs no redeploy.

You also need a `SESSION_SECRET` in `.env.local` (at least 32 characters):

```bash
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env.local
```

Passwords are hashed with scrypt from `node:crypto` — no native module to build.
Sessions are a signed JWT in an httpOnly cookie; there is no session table.

Two layers guard the admin: `proxy.ts` turns away requests whose session cookie
is missing or invalid, and every function in `lib/admin-works.ts` calls
`requireUser()` itself. The second is the one that matters — verifying in the
data layer means a new admin route cannot forget to check.

### Managing projects

`/admin/works` lists everything the client owns, drafts included, grouped by
section. From there they can add, edit, publish, unpublish and delete.

- **Web addresses are derived** from the title, and stop auto-updating the
  moment they are edited by hand. Editing an existing project never rewrites its
  address on its own — that would break any link already shared.
- **Drive links are normalised on save.** Whatever Drive hands over —
  `/file/d/<id>/view?usp=drivesdk`, `/open?id=<id>`, a bare ID — only the file ID
  is stored, and every URL is rebuilt from it. Folder links are rejected, since a
  folder cannot be embedded as a single video.
- **The video form carries a sharing reminder.** A wrong Drive permission is the
  most common way a video silently breaks, and it cannot be detected from the
  link itself.
- **Order is dragged, not numbered.** Projects within a section, and images
  within a project, are reordered by dragging the handle; the order saves on
  drop. Arrow buttons do the same thing from the keyboard, since drag-and-drop
  is not keyboard-reachable.
- **Deleting is a soft delete.** The row is kept and the slug is freed for reuse.
- **Publishing takes effect immediately.** Each mutation calls `updateTag`, which
  expires the cache rather than serving stale content, so the client sees their
  own change on the public site straight away.

### Images

Uploads go straight from the browser to object storage, never through a route
handler — Vercel caps serverless request bodies at about 4.5MB, which would
break the "add fifty images at once" case the admin exists for. Each file takes
three steps: ask `/api/admin/uploads/sign` for a short-lived URL, `PUT` the
bytes to it, then confirm, which records the row.

Nothing about the destination is client-controlled. Storage keys are built
server-side as `works/<work id>/<uuid>.<ext>`, so a filename cannot influence
where an object lands, and the confirm step re-checks that the key belongs to
the work being edited and that the object actually exists.

With no R2 credentials set, files are written to `.uploads/` and served from
`/api/media/...` — development only, and both routes disable themselves as soon
as R2 is configured.

#### Setting up R2

1. **Create a bucket.** Cloudflare dashboard → R2 → Create bucket.
2. **Create an API token.** R2 → Manage API Tokens → Create, with *Object Read &
   Write* on that bucket. This gives an Access Key ID and a Secret Access Key,
   shown once.
3. **Give the bucket a public URL.** Bucket → Settings → Public access: either
   enable the `r2.dev` subdomain (fine to start) or connect a custom domain
   (better — `r2.dev` is rate-limited and not meant for production traffic).
   This produces something like `https://pub-<id>.r2.dev`.

   `R2_PUBLIC_BASE_URL` must be **that** URL. It is not the S3 endpoint:
   `<account>.r2.cloudflarestorage.com` only answers signed requests, so images
   addressed there 404 for every visitor while uploads keep succeeding. The app
   refuses to start rather than let that combination ship.
4. **Add the CORS policy below**, under Bucket → Settings → CORS policy. Without
   it the browser blocks every upload: the bytes go straight from the browser to
   R2, so R2 must allow that origin.

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://your-site.example"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. **Set the five variables** from `.env.example`. `R2_ACCOUNT_ID` is in the
   dashboard URL and on the R2 overview page; `R2_PUBLIC_BASE_URL` is the public
   URL from step 3, with no trailing slash.

`R2_PUBLIC_BASE_URL` also feeds `images.remotePatterns` in
[next.config.ts](next.config.ts) — `next/image` refuses to optimise a host that
is not listed there, so changing the bucket domain needs a redeploy, not just an
env var edit.

The presigned URL signs `content-length` and `content-type`, so an upload cannot
exceed the size the server authorised or store something as `text/html` that the
public bucket would then serve as a live document.

The first image uploaded becomes the work's cover. Removing the cover promotes
the next image rather than leaving the card blank.

### Video

A work of kind `video` stores a Google Drive file ID and plays in a modal on the
site rather than sending the visitor to Drive. The modal keeps an "Open in
Drive" link, because a changed sharing permission breaks the embed silently and
there is no cross-origin way to detect it. The iframe mounts only when the modal
opens, so Drive is not contacted on page load. The cover image doubles as the
poster frame.

## Database

| Command | Effect |
| --- | --- |
| `npm run db:migrate` | Applies pending migrations. Idempotent. |
| `npm run db:seed` | Adds placeholder works, skipping any that exist. Never overwrites. |
| `npm run db:reset` | Wipes `works` and `assets`, then re-seeds. |
| `npm run admin:password -- <email>` | Creates or updates the admin account. |

Migrations are plain SQL in `db/migrations/`, applied in filename order and
tracked in a `schema_migrations` table.

Two schema decisions worth knowing, both from the architecture notes:

- **`published_at` gates public visibility.** Null means draft. Every public
  read goes through `lib/works.ts`, which filters in SQL.
- **`deleted_at` is a soft delete.** The unique index on `(category, slug)` is
  partial, so deleting a work frees its slug for reuse.

## Layout

```
app/(site)/[category]/     public gallery — one route serves all four sections
app/admin/                 login page and the guarded dashboard
proxy.ts                   optimistic auth redirect for /admin (was middleware.ts)
lib/works.ts               every public read, cached under the `works` tag
lib/admin-works.ts         admin reads: sees drafts, never cached, verifies first
lib/auth/                  password hashing, session cookie, and the DAL
lib/db.ts                  Postgres driver (Neon in production, PGlite locally)
db/migrations/             plain SQL, applied in order
scripts/                   migrate, seed, and admin-password CLIs
```

Content is cached with `cacheLife('max')` and tagged `works`, so it is served
statically until an edit invalidates the tag rather than expiring on a timer.
