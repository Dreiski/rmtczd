/**
 * Creates or updates the single admin account.
 *
 *   npm run admin:password -- someone@example.com
 *
 * Prompts for the password without echoing it. Run it again any time to rotate
 * the password or change the email — no redeploy needed, since the hash lives in
 * the database rather than an env var.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const { query, close } = await import("../lib/db.ts");
const { hashPassword } = await import("../lib/auth/password.ts");

const email = process.argv[2];

if (!email || !email.includes("@")) {
  console.error("Usage: npm run admin:password -- you@example.com");
  process.exit(1);
}

/** Reads a line with terminal echo suppressed. */
async function readSecret(prompt) {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });

  const onKeypress = () => {
    // Redraw the prompt without the typed characters.
    stdout.clearLine(0);
    stdout.cursorTo(0);
    stdout.write(prompt);
  };

  stdin.on("data", onKeypress);
  try {
    return await rl.question(prompt);
  } finally {
    stdin.off("data", onKeypress);
    rl.close();
    stdout.write("\n");
  }
}

const password = process.env.ADMIN_PASSWORD ?? (await readSecret("New password: "));

if (password.length < 12) {
  console.error("\nPassword must be at least 12 characters.");
  await close();
  process.exit(1);
}

const hash = await hashPassword(password);

const [existing] = await query("select id from users limit 1");

if (existing) {
  await query(
    "update users set email = $1, password_hash = $2, updated_at = now() where id = $3",
    [email, hash, existing.id]
  );
  console.log(`Updated the admin account (${email}).`);
} else {
  await query("insert into users (email, password_hash) values ($1, $2)", [
    email,
    hash,
  ]);
  console.log(`Created the admin account (${email}).`);
}

await close();
