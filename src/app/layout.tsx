// ============================================================================
// ShopSphere Root Application Layout (src/app/layout.tsx)
// Experiment 1 & 3: Root Layout, Metadata & Client Context Providers
// ============================================================================
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { CartProvider } from "@/components/cart/cart-provider";

export const metadata: Metadata = {
  title: {
    default: "ShopSphere | Full-Stack E-Commerce & Inventory Platform",
    template: "%s | ShopSphere",
  },
  description:
    "Full-stack e-commerce marketplace and inventory management platform built with Next.js App Router, MySQL/Prisma, MongoDB/Mongoose, Better Auth, RBAC, and Docker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
