/**
 * URL slugs.
 *
 * The client will type titles with accents, punctuation and em dashes. Deriving
 * the slug rather than asking for one keeps a non-technical user out of the
 * business of inventing web addresses, while still allowing an override.
 */

const MAX_LENGTH = 80;

export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      // Strip combining marks, so "Café" becomes "cafe" rather than "caf".
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MAX_LENGTH)
      .replace(/-+$/g, "")
  );
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= MAX_LENGTH && SLUG_PATTERN.test(value);
}
