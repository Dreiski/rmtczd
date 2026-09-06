import { CATEGORIES, type Category } from "./categories";
import type { Asset, Work, WorkWithAssets } from "./types";

/**
 * Data access for works.
 *
 * Backed by in-memory placeholder rows until step 1 of the build order in
 * docs/architecture.md, when the bodies of the exported functions become
 * Postgres queries. Everything above that line — the async signatures, the
 * snake_case row shape, and the published/soft-delete gating — is already what
 * the real implementation will use, so callers will not change.
 */

// ── Placeholder rows ────────────────────────────────────────────────────────

const PUBLISHED = "2026-01-01T00:00:00.000Z";

interface SeedCollection {
  slug: string;
  title: string;
  description: string;
  photos: { title: string; alt: string }[];
}

const SEED_COLLECTIONS: SeedCollection[] = [
  {
    slug: "monochrome-series",
    title: "Monochrome Series",
    description: "Black and white studies exploring light and shadow",
    photos: [
      { title: "Urban Shadows", alt: "City architecture in monochrome" },
      { title: "Morning Light", alt: "Early daylight through windows" },
      { title: "Contrast Study", alt: "High contrast black and white" },
      { title: "Textures", alt: "Surface details and patterns" },
      { title: "Silhouettes", alt: "Backlit figure studies" },
      { title: "Details", alt: "Close-up monochrome photography" },
    ],
  },
  {
    slug: "color-palette",
    title: "Color Palette",
    description: "Vibrant explorations of color theory and composition",
    photos: [
      { title: "Warm Tones", alt: "Golden hour color grading" },
      { title: "Cool Blues", alt: "Blue hour compositions" },
      { title: "Complementary", alt: "Opposite color harmony" },
      { title: "Saturation", alt: "Enhanced color vibrancy" },
      { title: "Pastels", alt: "Soft, muted color palettes" },
      { title: "Neon Lights", alt: "Vibrant artificial lighting" },
    ],
  },
  {
    slug: "urban-landscapes",
    title: "Urban Landscapes",
    description: "Architectural and cityscape edits",
    photos: [
      { title: "Downtown", alt: "City center architecture" },
      { title: "Skyline", alt: "Urban horizon at dusk" },
      { title: "Streets", alt: "Street-level compositions" },
      { title: "Structures", alt: "Modern building designs" },
      { title: "Perspectives", alt: "Geometric urban angles" },
      { title: "Night City", alt: "Urban nightscape views" },
    ],
  },
  {
    slug: "nature-refined",
    title: "Nature Refined",
    description: "Natural scenes with enhanced detail and clarity",
    photos: [
      { title: "Landscapes", alt: "Scenic mountain views" },
      { title: "Flora", alt: "Detailed plant photography" },
      { title: "Fauna", alt: "Wildlife enhanced details" },
      { title: "Waterscapes", alt: "Water and reflections" },
      { title: "Skies", alt: "Cloud formations and sunsets" },
      { title: "Seasons", alt: "Seasonal nature studies" },
    ],
  },
  {
    slug: "vintage-aesthetics",
    title: "Vintage Aesthetics",
    description: "Modern photos edited with classic film aesthetics",
    photos: [
      { title: "Film Stock", alt: "Classic film emulation" },
      { title: "Grain", alt: "Grain and texture effects" },
      { title: "Color Shift", alt: "Aged color grading" },
      { title: "Faded", alt: "Faded vintage look" },
      { title: "Retro Glow", alt: "Warm vintage tones" },
      { title: "Classic", alt: "Timeless classic edit style" },
    ],
  },
  {
    slug: "minimalist-concepts",
    title: "Minimalist Concepts",
    description: "Simplified compositions focusing on essential elements",
    photos: [
      { title: "Negative Space", alt: "Minimalist compositions" },
      { title: "Single Subject", alt: "Focused on one element" },
      { title: "Clean Lines", alt: "Geometric minimalism" },
      { title: "Empty Spaces", alt: "Sparse and serene" },
      { title: "Monolithic", alt: "Large single subjects" },
      { title: "Essential", alt: "Core elements only" },
    ],
  },
];

const WORKS: Work[] = [];
const ASSETS: Asset[] = [];

for (const category of CATEGORIES) {
  SEED_COLLECTIONS.forEach((collection, index) => {
    const workId = `${category}--${collection.slug}`;

    WORKS.push({
      id: workId,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      // Assumption to confirm: "edits" is the videographer section, so those
      // works exercise the video card path from §2 of the architecture doc.
      kind: category === "edits" ? "video" : "photo",
      year: 2026,
      category,
      cover_asset_id: null,
      // Left null deliberately — a placeholder Drive ID would render a broken
      // iframe. Real IDs arrive with the admin form in step 3.
      external_url: null,
      sort_order: index,
      published_at: PUBLISHED,
      deleted_at: null,
    });

    collection.photos.forEach((photo, photoIndex) => {
      ASSETS.push({
        id: `${workId}--${photoIndex}`,
        work_id: workId,
        storage_key: "",
        width: 1600,
        height: 1067,
        alt: `${photo.title} — ${photo.alt}`,
        sort_order: photoIndex,
      });
    });
  });
}

// ── Queries ─────────────────────────────────────────────────────────────────

/** Published, non-deleted. The gate every public query goes through. */
function isPublic(work: Work): boolean {
  return work.published_at !== null && work.deleted_at === null;
}

export async function listWorks(category: Category): Promise<Work[]> {
  return WORKS.filter((work) => work.category === category && isPublic(work)).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export async function getWork(
  category: Category,
  slug: string
): Promise<WorkWithAssets | null> {
  const work = WORKS.find(
    (candidate) =>
      candidate.category === category && candidate.slug === slug && isPublic(candidate)
  );

  if (!work) return null;

  const assets = ASSETS.filter((asset) => asset.work_id === work.id).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return { ...work, assets };
}

/** Every published work, used to prerender routes at build time. */
export async function listPublishedWorkPaths(): Promise<
  { category: Category; slug: string }[]
> {
  return WORKS.filter(isPublic).map((work) => ({
    category: work.category,
    slug: work.slug,
  }));
}

/** Works surfaced on the home carousel, most curated first. */
export async function listFeaturedWorks(limit = 7): Promise<Work[]> {
  return WORKS.filter(isPublic)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, limit);
}
