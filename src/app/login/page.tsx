// ============================================================================
// ShopSphere Sign-In & OAuth Authentication Page (/login)
// Experiment 7: Better Auth + Google/GitHub OAuth + Local Dev Personas
// ============================================================================
import React from "react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { LoginView } from "@/components/forms/login-view";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { getOAuthConfigurationStatus, getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const user = await getCurrentUser();
  const oauth = getOAuthConfigurationStatus();
  const env = getServerEnv();

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <LoginView
          currentUser={user}
          googleConfigured={oauth.googleConfigured}
          githubConfigured={oauth.githubConfigured}
          enableDevSwitcher={env.ENABLE_DEV_AUTH_SWITCHER}
          callbackUrl={callbackUrl || "/"}
        />
      </div>
    </StorefrontLayout>
  );
}
