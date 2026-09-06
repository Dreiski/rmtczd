import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * Optimistic auth check for /admin.
 *
 * Renamed from middleware.ts in Next 16. This only verifies the cookie's
 * signature — it deliberately does no database work, because it runs on every
 * matched request including prefetches. The authoritative check lives in
 * app/admin/(dashboard)/layout.tsx via requireUser(), which confirms the user
 * still exists.
 *
 * Its real job is keeping signed-out traffic off the admin entirely, so an
 * unauthenticated visitor never renders an admin route.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
