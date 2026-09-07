"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteWork } from "@/lib/admin-actions";
import { button } from "./ui";

/**
 * Delete, behind a confirmation.
 *
 * It was a single unguarded button, so one stray click removed a project. The
 * delete is soft, so nothing was ever truly lost — but the client cannot see
 * that, and "I clicked something and my work vanished" is not a reassuring
 * experience for the person whose portfolio it is.
 */

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={button.danger}>
      {pending ? "Deleting…" : "Yes, delete it"}
    </button>
  );
}

export default function DeleteWorkButton({
  workId,
  title,
}: {
  workId: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={button.quiet}
        >
          Delete this project
        </button>
        <p className="mt-2 text-xs text-subtle">
          Removes it from the site. It is kept in the database, so it can be
          brought back.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/5 p-4">
      <p className="text-sm">
        Delete <strong>{title}</strong>? It disappears from the site
        immediately. Its images are kept, and it can be restored.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <form action={deleteWork}>
          <input type="hidden" name="id" value={workId} />
          <ConfirmButton />
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={button.quiet}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
