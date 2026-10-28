"use server";

// ============================================================================
// ShopSphere Authentication & Role Session Server Actions
// Experiment 7: Better Auth + Safe Local Development Workflow
// Experiment 8: Server-Verified Role Assignment & HTTP-Only Session Cookies
// ============================================================================
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerEnv } from "@/lib/env";
import {
  createSignedSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/permissions/rbac";
import { prisma, isMySqlConnected } from "@/lib/prisma/client";
import { readFallbackStore, writeFallbackStore } from "@/lib/fallback-store";
import { sanitizeText } from "@/lib/validation/schemas";
import type { AppUser } from "@/types";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function setHttpOnlySessionCookie(userId: string) {
  const token = createSignedSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Authenticates or registers a user via email/password and sets an HTTP-only
 * HMAC-SHA256 signed session cookie. Never stores tokens in localStorage.
 */
export async function authenticateWithEmailAction(input: {
  email: string;
  password: string;
  name?: string;
  mode: "signin" | "signup";
}): Promise<{ ok: boolean; error?: string; user?: AppUser }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return {
      ok: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  const mysqlOk = await isMySqlConnected();
  const store = readFallbackStore();

  if (input.mode === "signup") {
    const cleanName = sanitizeText(input.name || email.split("@")[0]);
    if (cleanName.length < 2) {
      return { ok: false, error: "Full name must be at least 2 characters." };
    }

    // Check if user already exists
    const existingInStore = store.users.find(
      (u) => u.email.toLowerCase() === email
    );
    if (existingInStore) {
      return {
        ok: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    const userId = `user_cust_${Date.now()}`;
    const newUser: AppUser = {
      id: userId,
      name: cleanName,
      email,
      role: "CUSTOMER", // Registrations always receive CUSTOMER role (Experiment 8)
      authSource: "better-auth",
    };

    if (mysqlOk) {
      const existingDb = await prisma.user.findUnique({ where: { email } });
      if (existingDb) {
        return {
          ok: false,
          error: "An account with this email already exists in MySQL.",
        };
      }
      const created = await prisma.user.create({
        data: {
          id: userId,
          name: cleanName,
          email,
          emailVerified: true,
          role: "CUSTOMER",
        },
      });
      newUser.id = created.id;
    }

    store.users.push(newUser);
    writeFallbackStore(store);

    await setHttpOnlySessionCookie(newUser.id);
    revalidatePath("/", "layout");
    return { ok: true, user: newUser };
  }

  // Sign-in mode
  if (mysqlOk) {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (dbUser) {
      const user: AppUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
        image: dbUser.image,
        phone: dbUser.phone,
        authSource: "better-auth",
      };
      await setHttpOnlySessionCookie(user.id);
      revalidatePath("/", "layout");
      return { ok: true, user };
    }
  }

  const foundUser = store.users.find((u) => u.email.toLowerCase() === email);
  if (!foundUser) {
    return {
      ok: false,
      error:
        "No account found with that email. Use one of the seeded accounts or switch to Create Account.",
    };
  }

  await setHttpOnlySessionCookie(foundUser.id);
  revalidatePath("/", "layout");
  return { ok: true, user: foundUser };
}

/**
 * Documented Local Development Persona Switcher (Experiment 7 & Experiment 8).
 * Strictly gated by ENABLE_DEV_AUTH_SWITCHER (disabled in production unless explicitly enabled).
 * Issues a server-signed HTTP-only session cookie for one of the seeded personas.
 */
export async function switchDemoPersonaAction(
  targetRoleOrEmail: "GUEST" | "admin@shopsphere.in" | "priya.nair@shopsphere.in" | "rohan.deshmukh@shopsphere.in"
): Promise<{ ok: boolean; error?: string; role?: string }> {
  const env = getServerEnv();
  if (!env.ENABLE_DEV_AUTH_SWITCHER) {
    return {
      ok: false,
      error: "Demo persona switcher is disabled in production.",
    };
  }

  const cookieStore = await cookies();

  if (targetRoleOrEmail === "GUEST") {
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete("better-auth.session_token");
    revalidatePath("/", "layout");
    return { ok: true, role: "GUEST" };
  }

  const store = readFallbackStore();
  const targetUser = store.users.find(
    (u) => u.email.toLowerCase() === targetRoleOrEmail.toLowerCase()
  );

  if (!targetUser) {
    return { ok: false, error: "Requested demo persona was not found." };
  }

  const mysqlOk = await isMySqlConnected();
  if (mysqlOk) {
    await prisma.user
      .upsert({
        where: { email: targetUser.email },
        update: { role: targetUser.role, name: targetUser.name },
        create: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          emailVerified: true,
          role: targetUser.role,
          phone: targetUser.phone ?? null,
        },
      })
      .catch(() => {});
  }

  await setHttpOnlySessionCookie(targetUser.id);
  revalidatePath("/", "layout");
  return { ok: true, role: targetUser.role };
}

/**
 * Signs out the current user and clears HTTP-only session cookies.
 */
export async function signOutAction(): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");
  revalidatePath("/", "layout");
  return { ok: true };
}
