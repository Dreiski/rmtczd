"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";

const INITIAL: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-subtle">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="rounded-md border border-border bg-card px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-subtle">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-border bg-card px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-fg px-4 py-2 text-sm uppercase tracking-widest text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
