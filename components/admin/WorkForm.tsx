"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveWork, type WorkFormState } from "@/lib/admin-actions";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { slugify } from "@/lib/slug";
import type { Work } from "@/lib/types";

const INITIAL: WorkFormState = {};

const field =
  "rounded-md border border-border bg-card px-3 py-2 text-fg outline-none focus:border-accent";
const labelText = "text-xs uppercase tracking-widest text-subtle";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="text-xs text-accent">
      {message}
    </span>
  );
}

export default function WorkForm({ work }: { work?: Work }) {
  const [state, formAction, pending] = useActionState(saveWork, INITIAL);

  const initial = state.values ?? {
    title: work?.title ?? "",
    description: work?.description ?? "",
    slug: work?.slug ?? "",
    category: work?.category ?? "photo-highlights",
    kind: work?.kind ?? "photo",
    year: work?.year ? String(work.year) : "",
    driveUrl: work?.external_url ?? "",
    published: work?.published_at ? "on" : "",
  };

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [kind, setKind] = useState(initial.kind);

  // Deriving the slug keeps a non-technical user out of inventing web
  // addresses, but stops the moment they type their own, and never rewrites the
  // address of a project that is already published somewhere.
  const slugTouched = slug !== "" && slug !== slugify(title);
  const effectiveSlug = work ? slug : slugTouched ? slug : slugify(title);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {work && <input type="hidden" name="id" value={work.id} />}

      <label className="flex flex-col gap-2">
        <span className={labelText}>Title</span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={field}
        />
        <FieldError message={errors.title} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelText}>Description</span>
        <textarea
          name="description"
          defaultValue={initial.description}
          rows={3}
          className={field}
        />
        <FieldError message={errors.description} />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelText}>Section</span>
          <select
            name="category"
            defaultValue={initial.category}
            className={field}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_META[category].title}
              </option>
            ))}
          </select>
          <FieldError message={errors.category} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelText}>Type</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={field}
          >
            <option value="photo">Photos</option>
            <option value="video">Video</option>
          </select>
          <FieldError message={errors.kind} />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelText}>Year</span>
          <input
            name="year"
            defaultValue={initial.year}
            inputMode="numeric"
            placeholder="2026"
            className={field}
          />
          <FieldError message={errors.year} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelText}>Web address</span>
          <input
            name="slug"
            value={effectiveSlug}
            onChange={(e) => setSlug(e.target.value)}
            className={field}
          />
          <span className="text-xs text-subtle">
            /{initial.category}/{effectiveSlug || "…"}
          </span>
          <FieldError message={errors.slug} />
        </label>
      </div>

      {kind === "video" && (
        <label className="flex flex-col gap-2">
          <span className={labelText}>Google Drive link</span>
          <input
            name="driveUrl"
            defaultValue={initial.driveUrl}
            placeholder="https://drive.google.com/file/d/…/view"
            className={field}
          />
          {/* §2 mitigation (a): the most common way a video silently breaks is
              a sharing permission, not a bad link. */}
          <span className="rounded-md border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-subtle">
            In Google Drive, open <strong>Share</strong> on this video and set
            General access to <strong>“Anyone with the link”</strong>. Without
            that, visitors see an error instead of the video.
          </span>
          <FieldError message={errors.driveUrl} />
        </label>
      )}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial.published === "on"}
          className="h-4 w-4"
        />
        <span className="text-sm">
          Visible on the site
          <span className="ml-2 text-xs text-subtle">
            (leave unchecked to keep it as a draft)
          </span>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-fg px-4 py-2 text-sm uppercase tracking-widest text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <Link
          href="/admin/works"
          className="text-xs uppercase tracking-widest text-subtle hover:opacity-60"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
