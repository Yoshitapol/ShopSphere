// ============================================================================
// ShopSphere Better Auth Client Helper
// Experiment 7: Client-side OAuth & Session Trigger Utilities
// Uses ONLY NEXT_PUBLIC_APP_URL — zero server secrets exposed.
// ============================================================================
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
