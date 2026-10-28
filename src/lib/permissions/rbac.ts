// ============================================================================
// ShopSphere Server-Boundary Session & Role-Based Access Control (RBAC)
// Experiment 7: Session Retrieval & Verification
// Experiment 8: Role-Based Access Control (GUEST, CUSTOMER, ADMIN)
// Experiment 10: Protected with server-only; HMAC-verified session tokens
// ============================================================================
import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getServerEnv } from "@/lib/env";
import { prisma, isMySqlConnected } from "@/lib/prisma/client";
import { readFallbackStore } from "@/lib/fallback-store";
import type { AppUser, UserRole } from "@/types";

export const SESSION_COOKIE_NAME = "shopsphere_session";

function signPayload(userId: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(userId);
  return `${userId}.${hmac.digest("hex")}`;
}

export function createSignedSessionToken(userId: string): string {
  const { BETTER_AUTH_SECRET } = getServerEnv();
  return signPayload(userId, BETTER_AUTH_SECRET);
}

export function verifySignedSessionToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const lastDot = token.lastIndexOf(".");
  const userId = token.slice(0, lastDot);
  const providedSig = token.slice(lastDot + 1);
  if (!userId || !providedSig) return null;

  const { BETTER_AUTH_SECRET } = getServerEnv();
  const expectedToken = signPayload(userId, BETTER_AUTH_SECRET);
  const expectedSig = expectedToken.slice(expectedToken.lastIndexOf(".") + 1);

  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return null;
    return crypto.timingSafeEqual(a, b) ? userId : null;
  } catch {
    return null;
  }
}

function normalizeRole(role: string | undefined | null): UserRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "CUSTOMER") return "CUSTOMER";
  return "CUSTOMER";
}

/**
 * Resolves the currently authenticated user on the server.
 * 1. Checks Better Auth active session against MySQL when connected.
 * 2. Checks HMAC-SHA256 signed `shopsphere_session` HTTP-only cookie and looks up
 *    the user's authoritative role from the database / server store.
 * Never trusts a role passed in query parameters, headers, or unsigned cookies.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const mysqlOk = await isMySqlConnected();

  // 1. Check Better Auth session if MySQL is connected
  if (mysqlOk) {
    try {
      const reqHeaders = await headers();
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });

      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (dbUser) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: normalizeRole(dbUser.role),
            image: dbUser.image,
            phone: dbUser.phone,
            authSource: "better-auth",
          };
        }
      }
    } catch {
      // Fall through to signed session token check
    }
  }

  // 2. Check HMAC-SHA256 verified HTTP-only session cookie
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const verifiedUserId = verifySignedSessionToken(rawToken);

    if (!verifiedUserId) {
      return null;
    }

    if (mysqlOk) {
      const dbUser = await prisma.user.findUnique({
        where: { id: verifiedUserId },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: normalizeRole(dbUser.role),
          image: dbUser.image,
          phone: dbUser.phone,
          authSource: "better-auth",
        };
      }
    }

    const store = readFallbackStore();
    const fallbackUser = store.users.find((u) => u.id === verifiedUserId);
    if (fallbackUser) {
      return {
        ...fallbackUser,
        role: normalizeRole(fallbackUser.role),
      };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Requires an authenticated user (Customer or Admin). Redirects Guests to /login.
 */
export async function requireAuthenticatedUser(
  callbackPath = "/products"
): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  return user;
}

/**
 * Requires an ADMIN user.
 * - Unauthenticated Guests -> redirected to `/login?callbackUrl=/dashboard`
 * - Authenticated non-Admins (CUSTOMER) -> redirected to `/access-denied`
 */
export async function requireAdminUser(
  callbackPath = "/dashboard"
): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }
  return user;
}

/**
 * Authoritative RBAC check for API Route Handlers (`POST`, `PUT`, `PATCH`, `DELETE`).
 */
export async function verifyApiAdmin(): Promise<
  | { authorized: true; user: AppUser }
  | { authorized: false; status: 401 | 403; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required. Please sign in to perform this operation.",
    };
  }
  if (user.role !== "ADMIN") {
    return {
      authorized: false,
      status: 403,
      error:
        "Forbidden: Administrator role (ADMIN) is required to mutate catalog or operational data.",
    };
  }
  return { authorized: true, user };
}
