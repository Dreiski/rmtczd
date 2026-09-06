/**
 * Placeholder portfolio content, carried over from the hardcoded arrays the
 * pages used before they were database-backed. It exists so the site has
 * something to render before the client adds real work through the admin; it is
 * not application data and nothing outside scripts/seed.mjs reads it.
 */

export const CATEGORIES = ["edits", "photographs", "pubs", "personal"];

export const COLLECTIONS = [
  {
    slug: "monochrome-series",
    title: "Monochrome Series",
    description: "Black and white studies exploring light and shadow",
    photos: [
      ["Urban Shadows", "City architecture in monochrome"],
      ["Morning Light", "Early daylight through windows"],
      ["Contrast Study", "High contrast black and white"],
      ["Textures", "Surface details and patterns"],
      ["Silhouettes", "Backlit figure studies"],
      ["Details", "Close-up monochrome photography"],
    ],
  },
  {
    slug: "color-palette",
    title: "Color Palette",
    description: "Vibrant explorations of color theory and composition",
    photos: [
      ["Warm Tones", "Golden hour color grading"],
      ["Cool Blues", "Blue hour compositions"],
      ["Complementary", "Opposite color harmony"],
      ["Saturation", "Enhanced color vibrancy"],
      ["Pastels", "Soft, muted color palettes"],
      ["Neon Lights", "Vibrant artificial lighting"],
    ],
  },
  {
    slug: "urban-landscapes",
    title: "Urban Landscapes",
    description: "Architectural and cityscape edits",
    photos: [
      ["Downtown", "City center architecture"],
      ["Skyline", "Urban horizon at dusk"],
      ["Streets", "Street-level compositions"],
      ["Structures", "Modern building designs"],
      ["Perspectives", "Geometric urban angles"],
      ["Night City", "Urban nightscape views"],
    ],
  },
  {
    slug: "nature-refined",
    title: "Nature Refined",
    description: "Natural scenes with enhanced detail and clarity",
    photos: [
      ["Landscapes", "Scenic mountain views"],
      ["Flora", "Detailed plant photography"],
      ["Fauna", "Wildlife enhanced details"],
      ["Waterscapes", "Water and reflections"],
      ["Skies", "Cloud formations and sunsets"],
      ["Seasons", "Seasonal nature studies"],
    ],
  },
  {
    slug: "vintage-aesthetics",
    title: "Vintage Aesthetics",
    description: "Modern photos edited with classic film aesthetics",
    photos: [
      ["Film Stock", "Classic film emulation"],
      ["Grain", "Grain and texture effects"],
      ["Color Shift", "Aged color grading"],
      ["Faded", "Faded vintage look"],
      ["Retro Glow", "Warm vintage tones"],
      ["Classic", "Timeless classic edit style"],
    ],
  },
  {
    slug: "minimalist-concepts",
    title: "Minimalist Concepts",
    description: "Simplified compositions focusing on essential elements",
    photos: [
      ["Negative Space", "Minimalist compositions"],
      ["Single Subject", "Focused on one element"],
      ["Clean Lines", "Geometric minimalism"],
      ["Empty Spaces", "Sparse and serene"],
      ["Monolithic", "Large single subjects"],
      ["Essential", "Core elements only"],
    ],
  },
];
