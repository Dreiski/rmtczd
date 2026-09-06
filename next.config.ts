import type { NextConfig } from "next";

/**
 * next/image will only optimise remote images from hosts listed here, so the R2
 * public domain has to be declared. It is read from the environment because the
 * bucket's domain differs per deployment; with no R2 configured, images are
 * served same-origin from /api/media and need no entry at all.
 */
function r2RemotePattern() {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return [];

  try {
    const url = new URL(base);
    return [
      {
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
        pathname: "/**",
      },
    ];
  } catch {
    throw new Error(`R2_PUBLIC_BASE_URL is not a valid URL: ${base}`);
  }
}

const nextConfig: NextConfig = {
  // Enables `use cache`, cacheTag and cacheLife, which lib/works.ts uses so the
  // admin's publish action can invalidate the gallery by tag. See §4 of
  // docs/architecture.md.
  cacheComponents: true,

  // PGlite ships a WASM build that loads its own filesystem assets; bundling it
  // breaks that path resolution. It is only reached by the local development
  // fallback in lib/db.ts, never in production.
  serverExternalPackages: ["@electric-sql/pglite"],

  images: {
    remotePatterns: r2RemotePattern(),
  },
};

export default nextConfig;
