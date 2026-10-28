// ============================================================================
// ShopSphere Next.js Edge Middleware (Early Route Boundary Protection)
// Experiment 8: Role-Based Access Control (Early Route Checks + Node.js DB Verification)
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/checkout", "/orders", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie or signed ShopSphere session cookie
  const betterAuthToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;
  const shopSphereToken = request.cookies.get("shopsphere_session")?.value;

  const hasSessionCookie = Boolean(
    betterAuthToken || (shopSphereToken && shopSphereToken.includes("."))
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/dashboard/:path*"],
};
