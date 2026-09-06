import type { Category } from "./categories";

/**
 * Mirrors the schema in docs/architecture.md. Field names are snake_case to
 * match the SQL columns, so the step-1 Postgres queries can return rows
 * directly without a mapping layer.
 */

export type WorkKind = "photo" | "video";

export interface Work {
  id: string;
  slug: string;
  title: string;
  /**
   * Not in the doc's schema. The current UI shows a caption on every card and
   * work header, so the column is needed. Flagged for review — per the doc's
   * own "cheap now, expensive later" rule this belongs in the first migration.
   */
  description: string;
  /** Photo works open a lightbox; video works open the Drive embed modal. */
  kind: WorkKind;
  year: number | null;
  category: Category;
  cover_asset_id: string | null;
  /** Google Drive *file ID* for kind='video' — never the pasted URL. */
  external_url: string | null;
  sort_order: number;
  /** Null means draft. Gates public visibility. */
  published_at: string | null;
  /** Non-null means soft-deleted. */
  deleted_at: string | null;
}

export interface Asset {
  id: string;
  work_id: string;
  storage_key: string;
  width: number;
  height: number;
  alt: string;
  sort_order: number;
}
