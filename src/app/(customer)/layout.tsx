// ============================================================================
// ShopSphere (customer) Route Group Layout
// Experiment 1 & 3: Route Groups & Shared Customer Layout
// ============================================================================
import React, { type ReactNode } from "react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";

export default function CustomerGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
