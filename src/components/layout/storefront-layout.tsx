// ============================================================================
// ShopSphere Shared Public & Customer Storefront Layout Wrapper
// Experiment 3: Shared Storefront Layout (Navbar + Main Content + Footer)
// ============================================================================
import React, { type ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { getServerEnv } from "@/lib/env";

export async function StorefrontLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const env = getServerEnv();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        user={user}
        enableDevSwitcher={env.ENABLE_DEV_AUTH_SWITCHER}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
