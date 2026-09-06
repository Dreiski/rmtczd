-- Initial schema for the portfolio CMS. See docs/architecture.md.
--
-- Two decisions the doc flagged as "cheap now, expensive later" are both taken
-- here: soft deletes via deleted_at, and published_at gating public visibility.

create table works (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null,
  title          text not null,
  -- Not in the doc's schema, but every card and work header renders a caption.
  description    text not null default '',
  kind           text not null check (kind in ('photo', 'video')),
  year           integer,
  category       text not null check (category in ('edits', 'photographs', 'pubs', 'personal')),
  -- FK added after `assets` exists; the two tables reference each other.
  cover_asset_id uuid,
  -- Google Drive *file ID* for kind='video'. The admin extracts this from
  -- whatever URL the client pastes; a full URL must never land here.
  external_url   text,
  sort_order     integer not null default 0,
  published_at   timestamptz,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Slugs are unique per category, not globally: the URL is /[category]/[slug],
-- and the client may well want "behind-the-scenes" in two sections.
-- Partial, so a soft-deleted work does not squat on its slug forever.
create unique index works_category_slug_key
  on works (category, slug)
  where deleted_at is null;

-- Covers the public gallery query: one category, curated order.
create index works_public_idx
  on works (category, sort_order)
  where published_at is not null and deleted_at is null;

create table assets (
  id          uuid primary key default gen_random_uuid(),
  work_id     uuid not null references works (id) on delete cascade,
  storage_key text not null,
  width       integer not null,
  height      integer not null,
  alt         text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index assets_work_idx on assets (work_id, sort_order);

-- Clearing the cover when its asset is deleted is better than blocking the
-- delete; the card falls back to a placeholder.
alter table works
  add constraint works_cover_asset_fk
  foreign key (cover_asset_id) references assets (id) on delete set null;
