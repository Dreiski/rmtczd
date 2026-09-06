"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isCategory, type Category } from "./categories";
import { parseDriveLink } from "./drive";
import { isValidSlug, slugify } from "./slug";
import {
  createWork,
  getWorkById,
  setPublished,
  softDeleteWork,
  updateWork,
  SlugTakenError,
  type WorkInput,
} from "./admin-works";

/**
 * Mutations for the admin.
 *
 * Every one ends with updateTag('works'). §4 of docs/architecture.md asked for
 * revalidateTag, but that is stale-while-revalidate: the client would publish,
 * reload the public page, still see the old version, and report it as broken.
 * updateTag expires immediately, giving read-your-own-writes — which is the
 * behaviour a non-technical client expects from a Publish button.
 */

export interface WorkFormState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
}

function validate(
  formData: FormData
): { ok: true; input: WorkInput } | { ok: false; state: WorkFormState } {
  const fieldErrors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "");
  const rawKind = String(formData.get("kind") ?? "");
  const rawYear = String(formData.get("year") ?? "").trim();
  const driveUrl = String(formData.get("driveUrl") ?? "").trim();
  const published = formData.get("published") === "on";

  // Echoed back so a rejected submission does not wipe what was typed.
  const values = {
    title,
    description,
    slug: rawSlug,
    category: rawCategory,
    kind: rawKind,
    year: rawYear,
    driveUrl,
    published: published ? "on" : "",
  };

  if (!title) fieldErrors.title = "Give the project a title.";
  else if (title.length > 200) fieldErrors.title = "Keep the title under 200 characters.";

  if (description.length > 500) {
    fieldErrors.description = "Keep the description under 500 characters.";
  }

  const slug = rawSlug || slugify(title);
  if (!slug) {
    fieldErrors.slug =
      "Could not build a web address from that title. Enter one manually.";
  } else if (!isValidSlug(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  if (!isCategory(rawCategory)) fieldErrors.category = "Choose a section.";
  if (rawKind !== "photo" && rawKind !== "video") {
    fieldErrors.kind = "Choose photos or video.";
  }

  let year: number | null = null;
  if (rawYear) {
    const parsed = Number(rawYear);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2200) {
      fieldErrors.year = "Enter a four-digit year.";
    } else {
      year = parsed;
    }
  }

  // The Drive link is only meaningful for video, and is required there —
  // a video work with no link renders a play button that does nothing.
  let externalUrl: string | null = null;
  if (rawKind === "video") {
    const parsed = parseDriveLink(driveUrl);
    if (!parsed.ok) fieldErrors.driveUrl = parsed.reason;
    else externalUrl = parsed.fileId;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { fieldErrors, values } };
  }

  return {
    ok: true,
    input: {
      title,
      slug,
      description,
      category: rawCategory as Category,
      kind: rawKind as "photo" | "video",
      year,
      externalUrl,
      published,
    },
  };
}

export async function saveWork(
  _prev: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const result = validate(formData);

  if (!result.ok) return result.state;

  try {
    if (id) {
      await updateWork(id, result.input);
    } else {
      await createWork(result.input);
    }
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return {
        fieldErrors: { slug: error.message },
        values: Object.fromEntries(
          [...formData.entries()]
            .filter(([, v]) => typeof v === "string")
            .map(([k, v]) => [k, String(v)])
        ),
      };
    }
    throw error;
  }

  updateTag("works");
  redirect("/admin/works");
}

export async function togglePublished(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("published") === "true";

  const work = await getWorkById(id);
  if (!work) return;

  await setPublished(id, next);
  updateTag("works");
}

export async function deleteWork(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  const work = await getWorkById(id);
  if (!work) return;

  await softDeleteWork(id);
  updateTag("works");
  redirect("/admin/works");
}
