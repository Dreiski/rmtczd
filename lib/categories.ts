export const CATEGORIES = ["edits", "photographs", "pubs", "personal"] as const;

export type Category = (typeof CATEGORIES)[number];

interface CategoryMeta {
  /** Heading shown on the category page. */
  title: string;
  /** Sub-heading under the title. */
  blurb: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  edits: {
    title: "Edits",
    blurb: "Moving-image work, cut and graded",
  },
  photographs: {
    title: "Photographs",
    blurb: "Curated collections of refined and enhanced photographs",
  },
  pubs: {
    title: "Pubs",
    blurb: "Selected published and commissioned work",
  },
  personal: {
    title: "Personal Projects",
    blurb: "Ongoing work made for its own sake",
  },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
