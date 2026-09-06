import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables `use cache`, cacheTag and cacheLife, which lib/works.ts uses so the
  // admin's publish action can invalidate the gallery by tag. See §4 of
  // docs/architecture.md.
  cacheComponents: true,

  // PGlite ships a WASM build that loads its own filesystem assets; bundling it
  // breaks that path resolution. It is only reached by the local development
  // fallback in lib/db.ts, never in production.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
