# Photographer/Videographer Portfolio — CMS Architecture Notes

Handoff notes for the client-editable portfolio site. Drop this in the repo
(e.g. `docs/architecture.md`) so it's available as context while building.

---

## Context

- Existing: template portfolio site (Next.js + Tailwind).
- Goal: client can add and update their own work without touching code.
- Client is non-technical. Expect them to use ~3 screens, no more.

---

## Decisions made

### 1. Custom `/admin` inside the Next.js app — not a headless CMS

Considered and rejected:

| Option | Why not |
| --- | --- |
| Git-based CMS (TinaCMS, Decap) | Full rebuild per edit; bad when adding 50 images at once |
| Hosted CMS (Sanity, Payload Cloud) | Good fallback, but scope no longer justifies the dependency |
| Self-hosted CMS (Directus, Strapi) | Whole extra service to run for three screens |
| Notion / Google Sheets | No structure for ordering rules |

Custom admin wins because the video decision (below) removed most of the
complexity, and it's the strongest portfolio piece of the options.

**Accepted tradeoff:** a custom admin makes you the permanent support line for
this client. If this is fixed-fee and being handed off, revisit and use a
hosted CMS instead.

### 2. Video = snapshots + external Google Drive link

No transcoding, no HLS, no Mux/bunny/Cloudflare Stream, no asset-status
webhooks. Video becomes a *kind* of work, not a media type.

Implications:

- **Normalize the Drive URL on save.** The client will paste any of
  `/file/d/{id}/view?usp=drivesdk`, `/open?id={id}`, or a folder link.
  Extract the file ID server-side, store only the ID, construct links yourself.
- **Prefer embedding over redirecting.** `https://drive.google.com/file/d/{id}/preview`
  works in an iframe — open a modal player on-site instead of bouncing the
  visitor to Drive. Keep an "Open in Drive" fallback link inside the modal.
- **Known failure mode:** sharing permissions. One permission change kills a
  link silently. Mitigations by effort: (a) reminder text in the admin form to
  set "Anyone with the link", (b) weekly cron that HEADs each URL and flags
  broken ones in the admin, (c) nothing, fix on report.
- Unlisted Vimeo/YouTube would be strictly better technically (real embed,
  poster frame, no permission fragility) at the same client effort — but Drive
  is a reasonable call if deliverables already live there.

### 3. Media handling

Images are now the only real media (web-sized exports, a few MB each).

- Presigned PUT direct to DigitalOcean Spaces / S3 / R2 is still the right
  shape (~30 lines) but no longer mandatory at this scale.
- A Next.js route handler accepting the file and piping to storage is
  acceptable here.
- Derive image sizes on demand (`next/image`) rather than at upload time —
  less code, handles re-uploads for free.

### 4. Rendering

- ISR + on-demand revalidation. Publish button → webhook/route handler →
  `revalidateTag('works')`.
- Add draft mode so unpublished work can be previewed.

---

## Schema

```sql
works (
  id,
  slug,
  title,
  kind,             -- 'photo' | 'video'
  year,
  category,
  cover_asset_id,
  external_url,     -- Drive file ID for kind='video'
  sort_order,       -- explicit integer; curation order gets fiddled with most
  published_at,     -- nullable; gates public visibility
  deleted_at        -- soft delete
)

assets (
  id,
  work_id,
  storage_key,
  width,
  height,
  alt,
  sort_order
)
```

A photo work has many assets. A video work has one or a few snapshot assets
plus `external_url`. Same card component renders both — the video card gets a
play-glyph overlay so nobody clicks expecting a lightbox.

**Decide before writing the first migration** (both are cheap now, expensive later):

- Soft deletes via `deleted_at` — the client will eventually delete the wrong project.
- `published_at` gating public visibility from day one — nullable column now vs.
  a migration plus scattered query changes later.

---

## Build order

Backend slice verified before touching the frontend, one step at a time.

1. **Schema + public gallery.** Seed two or three works by hand, render the
   public site from the database. No admin yet — proves the data shape first.
2. **Auth.** Auth.js with one seeded credentials user, or a single hashed
   password in an env var. There is one user and there will only ever be one.
   Do not build user management.
3. **Create/edit work.** Text fields and the Drive URL only. No images yet.
4. **Image upload.**
5. **Drag-drop reordering.** Last — fiddliest UI, least essential. Client can
   live with upload-order for a week.

---

## Deliberately deferred

Do not build until the client actually asks:

- Tagging
- Collections / series grouping
- SEO fields
- Multi-user accounts
- Analytics
