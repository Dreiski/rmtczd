/**
 * The four sections of the site.
 *
 * These strings are the URL segment (/photo-highlights/...) and the value in
 * works.category, which is constrained in the database. Renaming one means a
 * migration, not just an edit here — see db/migrations/004.
 */
export const CATEGORIES = [
  "photo-highlights",
  "video-highlights",
  "same-day-edits",
  "studio-shoots",
] as const;

export type Category = (typeof CATEGORIES)[number];

interface CategoryMeta {
  /** Heading shown on the category page, and the label in the menu. */
  title: string;
  /** Sub-heading under the title. */
  blurb: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  "photo-highlights": {
    title: "Photo Highlights",
    blurb: "Selected photographs from recent work",
  },
  "video-highlights": {
    title: "Video Highlights",
    blurb: "Films cut from the day's best moments",
  },
  "same-day-edits": {
    title: "Same Day Edits",
    blurb: "Shot, cut and screened before the night is over",
  },
  "studio-shoots": {
    title: "Studio Shoots",
    blurb: "Portraits and sessions made in the studio",
  },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
