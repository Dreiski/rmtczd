/**
 * Thin query layer over Postgres.
 *
 * Two drivers, chosen by whether DATABASE_URL is set:
 *
 *   - Neon (`@neondatabase/serverless`) for any real Postgres URL. This is the
 *     production path.
 *   - PGlite (Postgres compiled to WASM, a devDependency) as a zero-setup local
 *     fallback, storing data under .pglite/. It keeps `npm run dev` working
 *     without provisioning a cloud database, and lets the migration and seed
 *     scripts exercise the exact SQL the app runs.
 *
 * Both drivers take `$1`-style placeholders and return plain row objects, so
 * callers never see the difference.
 *
 * Deliberately free of Next-specific imports: scripts/ loads this module
 * directly under plain Node (which strips the types), so the migration and seed
 * paths cannot drift from the application's.
 */

export type Row = Record<string, unknown>;

interface Driver {
  /** Single statement with `$1`-style parameters. */
  query(text: string, params: unknown[]): Promise<Row[]>;
  /**
   * Multi-statement script, no parameters. Both drivers route this through the
   * simple query protocol, which is the only one that accepts more than one
   * statement per call — `query()` will reject a migration file.
   */
  exec(text: string): Promise<void>;
  /** Releases handles so a short-lived script can exit. */
  close(): Promise<void>;
}

let driver: Promise<Driver> | null = null;

function connect(): Promise<Driver> {
  const url = process.env.DATABASE_URL;

  if (url) {
    return import("@neondatabase/serverless").then(
      ({ neon, neonConfig, Client }) => {
        // Node 18+ and modern edge runtimes expose a global WebSocket; Pool and
        // Client need it, while the HTTP `neon()` path does not.
        if (!neonConfig.webSocketConstructor && globalThis.WebSocket) {
          neonConfig.webSocketConstructor =
            globalThis.WebSocket as unknown as typeof neonConfig.webSocketConstructor;
        }

        const sql = neon(url);

        return {
          async query(text, params) {
            return (await sql.query(text, params)) as unknown as Row[];
          },
          async exec(text) {
            // A WebSocket client, unlike the HTTP one, speaks the full protocol.
            // Opened and closed per call: this runs from migrations only.
            const client = new Client(url);
            await client.connect();
            try {
              await client.query(text);
            } finally {
              await client.end();
            }
          },
          // The HTTP driver is stateless; nothing to release.
          async close() {},
        } satisfies Driver;
      }
    );
  }

  // Falling back to an ephemeral local database on a real deploy would silently
  // serve an empty site, so refuse rather than guess.
  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL is not set. The PGlite fallback is for local development only."
    );
  }

  console.warn(
    "[db] DATABASE_URL not set — using the local PGlite database in .pglite/"
  );

  return import("@electric-sql/pglite").then(async ({ PGlite }) => {
    const db = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
    await db.waitReady;

    return {
      async query(text, params) {
        return (await db.query(text, params)).rows as Row[];
      },
      async exec(text) {
        await db.exec(text);
      },
      async close() {
        await db.close();
      },
    } satisfies Driver;
  });
}

function getDriver(): Promise<Driver> {
  // Cached as a promise, not a value, so concurrent callers during startup
  // share one connection rather than racing to open several.
  driver ??= connect();
  return driver;
}

// Unconstrained on purpose: callers pass row interfaces like `Work`, which are
// structurally rows but have no index signature and so do not extend `Row`.
export async function query<T = Row>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  return (await getDriver()).query(text, params) as Promise<T[]>;
}

export async function exec(text: string): Promise<void> {
  return (await getDriver()).exec(text);
}

/**
 * Only for short-lived scripts. PGlite holds the event loop open, so a CLI that
 * does not call this never exits. The app never calls it.
 */
export async function close(): Promise<void> {
  if (!driver) return;
  const current = driver;
  driver = null;
  await (await current).close();
}
