-- The single admin account.
--
-- docs/architecture.md is explicit: there is one user and there will only ever
-- be one. This table exists so the password can be rotated without a redeploy,
-- not as the start of a user system. No roles, no invites, no sign-up — if a
-- second row ever looks necessary, revisit the decision rather than adding one.

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  -- scrypt, encoded as scrypt$N$r$p$<salt>$<hash>. See lib/auth/password.ts.
  password_hash text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index users_email_key on users (lower(email));
