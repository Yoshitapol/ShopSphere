// ============================================================================
// ShopSphere (public) Route Group Layout
// Experiment 1 & 3: Route Groups & Shared Public Layout
// ============================================================================
import React, { type ReactNode } from "react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";

export default function PublicGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
