// ============================================================================
// ShopSphere Better Auth Next.js App Router Catch-All Handler
// Experiment 7: Better Auth OAuth Callbacks & Session Endpoints
// ============================================================================
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

export const { GET, POST } = toNextJsHandler(auth);
