-- The initial seed created six asset rows per work with an empty storage_key,
-- standing in for images before uploads existed. Once next/image started
-- rendering assets for real, those rows resolved to a URL with no object key
-- and every work page showed broken images.
--
-- An asset is a row about a stored file. A row with no file is not a
-- placeholder, it is a broken image, so remove them and make the state
-- unrepresentable. works.cover_asset_id is ON DELETE SET NULL, so any work
-- whose cover was one of these simply falls back to its placeholder colour.

delete from assets where storage_key = '';

alter table assets
  add constraint assets_storage_key_not_empty
  check (length(storage_key) > 0);
