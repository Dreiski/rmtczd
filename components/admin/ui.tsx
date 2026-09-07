/**
 * Shared admin styling.
 *
 * The admin had button and field classes copied inline at every call site, so
 * two buttons meant to look the same drifted apart. These are the vocabulary;
 * nothing here is clever, it just exists in one place.
 */

export const button = {
  /** Main action on a screen. One per view. */
  primary:
    "inline-flex items-center justify-center gap-2 rounded-md bg-fg px-4 py-2 text-sm font-medium tracking-wide text-bg transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
  /** Everything else that is still a real action. */
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm tracking-wide text-fg transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50",
  /** Low-emphasis, inline with text. */
  quiet:
    "inline-flex items-center gap-1.5 rounded text-xs uppercase tracking-widest text-subtle transition-opacity hover:opacity-60 disabled:opacity-30",
  /** Destructive. Never the primary action on a screen. */
  danger:
    "inline-flex items-center justify-center gap-2 rounded-md border border-accent/40 px-3 py-2 text-sm text-accent transition-colors hover:bg-accent/10",
};

export const field =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-fg outline-none transition-colors focus:border-accent";

export const label = "text-xs font-medium uppercase tracking-widest text-subtle";

export const card = "rounded-lg border border-border bg-card";

/** Page heading with an optional action on the right. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-light tracking-wide sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-prose text-sm text-subtle">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Shown where a list would be, when the list is empty. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-subtle">{description}</p>
      )}
      {action}
    </div>
  );
}

/** Live / Draft, and anything else with two states. */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "live" | "draft" | "warning";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "border-border text-subtle",
    live: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
    draft: "border-border text-subtle",
    warning: "border-accent/40 text-accent",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
