// ============================================================================
// ShopSphere Root Application Layout (src/app/layout.tsx)
// Experiment 1 & 3: Root Layout, Metadata & Client Context Providers
// ============================================================================
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { CartProvider } from "@/components/cart/cart-provider";

const plusJakartaSans = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "ShopSphere — Online Shopping for Electronics, Audio & Workspace Gear",
    template: "%s | ShopSphere India",
  },
  description:
    "Shop premium wireless headphones, creator laptops, smart wearables, mechanical keyboards, and smart home appliances at great prices in India with free express delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-ink-900 font-sans antialiased">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
