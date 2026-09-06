-- Renames the four sections to the client's own language, and moves the URL
-- with them so /photo-highlights matches the menu rather than /photographs.
--
-- Done as a rename rather than a display-label change because the value is the
-- URL segment. Nothing links here yet and the site is not indexed, so this is
-- the cheapest moment; afterwards it breaks shared links.
--
--   photographs -> photo-highlights
--   edits       -> video-highlights
--   pubs        -> same-day-edits
--   personal    -> studio-shoots

-- Drop first: the old constraint would reject every new value.
alter table works drop constraint works_category_check;

update works set category = case category
  when 'photographs' then 'photo-highlights'
  when 'edits'       then 'video-highlights'
  when 'pubs'        then 'same-day-edits'
  when 'personal'    then 'studio-shoots'
  else category
end;

alter table works
  add constraint works_category_check
  check (category in ('photo-highlights', 'video-highlights', 'same-day-edits', 'studio-shoots'));
