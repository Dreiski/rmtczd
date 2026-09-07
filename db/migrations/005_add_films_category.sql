-- Adds a fifth section, Films.
--
-- Sections are a CHECK constraint rather than a lookup table: there are a
-- handful, they change once in a blue moon, and each one needs a title and a
-- blurb in the code anyway. Adding one is this migration plus an entry in
-- lib/categories.ts; everything else is driven off CATEGORIES.

alter table works drop constraint works_category_check;

alter table works
  add constraint works_category_check
  check (category in (
    'photo-highlights',
    'video-highlights',
    'same-day-edits',
    'studio-shoots',
    'films'
  ));
