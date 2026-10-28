// ============================================================================
// ShopSphere Server-Only Environment Configuration & Validation
// Experiment 10: Environment Variable Security
// Importing "server-only" guarantees a build-time error if this module is ever
// imported into a Client Component ("use client").
// ============================================================================
import "server-only";

export interface ServerEnvConfig {
  DATABASE_URL: string;
  MONGODB_URI: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ENABLE_DEV_AUTH_SWITCHER: boolean;
  NODE_ENV: string;
}

function isPlaceholder(val: string | undefined): boolean {
  if (!val || val.trim() === "") return true;
  const lower = val.toLowerCase();
  return (
    lower.includes("your-google-") ||
    lower.includes("your-github-") ||
    lower.includes("replace-with-") ||
    lower === "placeholder"
  );
}

export function getServerEnv(): ServerEnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    MONGODB_URI: process.env.MONGODB_URI ?? "",
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ??
      "shopsphere-fallback-dev-secret-key-at-least-32-bytes",
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
    ENABLE_DEV_AUTH_SWITCHER:
      process.env.ENABLE_DEV_AUTH_SWITCHER === "true" ||
      process.env.NODE_ENV !== "production",
    NODE_ENV: process.env.NODE_ENV ?? "development",
  };
}

export function getOAuthConfigurationStatus(): {
  googleConfigured: boolean;
  githubConfigured: boolean;
} {
  const env = getServerEnv();
  return {
    googleConfigured:
      !isPlaceholder(env.GOOGLE_CLIENT_ID) &&
      !isPlaceholder(env.GOOGLE_CLIENT_SECRET),
    githubConfigured:
      !isPlaceholder(env.GITHUB_CLIENT_ID) &&
      !isPlaceholder(env.GITHUB_CLIENT_SECRET),
  };
}

/**
 * Returns a sanitized summary of environment configuration status for the Admin
 * Security Audit panel (Experiment 10). Never returns secret values!
 */
export function getSanitizedEnvAudit() {
  const env = getServerEnv();
  const oauth = getOAuthConfigurationStatus();
  return [
    {
      variable: "DATABASE_URL",
      scope: "Server-Only (Private)",
      configured: Boolean(env.DATABASE_URL && env.DATABASE_URL.startsWith("mysql")),
      maskedPreview: env.DATABASE_URL
        ? env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:********@")
        : "Not Set",
      purpose: "MySQL / Prisma transactional connection string",
    },
    {
      variable: "MONGODB_URI",
      scope: "Server-Only (Private)",
      configured: Boolean(env.MONGODB_URI && env.MONGODB_URI.startsWith("mongodb")),
      maskedPreview: env.MONGODB_URI
        ? env.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:********@")
        : "Not Set",
      purpose: "MongoDB / Mongoose product catalog connection string",
    },
    {
      variable: "BETTER_AUTH_SECRET",
      scope: "Server-Only (Private)",
      configured: Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 16),
      maskedPreview: "******** (Redacted Server Secret)",
      purpose: "HMAC signing key for Better Auth session tokens & cookies",
    },
    {
      variable: "GOOGLE_CLIENT_ID / SECRET",
      scope: "Server-Only (Private)",
      configured: oauth.googleConfigured,
      maskedPreview: oauth.googleConfigured ? "Configured (Redacted)" : "Placeholder / Not Configured",
      purpose: "Google OAuth 2.0 credentials for Better Auth",
    },
    {
      variable: "GITHUB_CLIENT_ID / SECRET",
      scope: "Server-Only (Private)",
      configured: oauth.githubConfigured,
      maskedPreview: oauth.githubConfigured ? "Configured (Redacted)" : "Placeholder / Not Configured",
      purpose: "GitHub OAuth 2.0 credentials for Better Auth",
    },
    {
      variable: "NEXT_PUBLIC_APP_NAME",
      scope: "Public (Browser-Safe)",
      configured: true,
      maskedPreview: process.env.NEXT_PUBLIC_APP_NAME ?? "ShopSphere",
      purpose: "Public application display title",
    },
    {
      variable: "NEXT_PUBLIC_CURRENCY_SYMBOL",
      scope: "Public (Browser-Safe)",
      configured: true,
      maskedPreview: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "₹",
      purpose: "Public INR currency symbol for UI formatting",
    },
  ];
}
