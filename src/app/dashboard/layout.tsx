// ============================================================================
// ShopSphere Protected Admin Dashboard Layout (src/app/dashboard/layout.tsx)
// Experiment 3: Nested Dashboard Layout with Persistent Client State Widget
// Experiment 8: Server-Boundary Admin Role Verification (requireAdminUser)
// ============================================================================
import React, { type ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAdminUser } from "@/lib/permissions/rbac";
import { getDatabaseHealthStatus } from "@/lib/mongodb/product-service";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminUser("/dashboard");
  const health = await getDatabaseHealthStatus();

  return (
    <DashboardShell user={user} health={health}>
      {children}
    </DashboardShell>
  );
}
