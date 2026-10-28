import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Smartphone,
  CreditCard,
  Globe,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-950 text-slate-300 border-t border-slate-800">
      {/* Top Value Bar */}
      <div className="border-b border-white/10 bg-ink-900/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Express Pan-India Delivery
                </p>
                <p className="text-[11px] text-slate-400">
                  Free shipping on orders over ₹2,000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  100% Authorized Dealer
                </p>
                <p className="text-[11px] text-slate-400">
                  Official brand warranty &amp; GST invoice
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  7-Day Easy Replacement
                </p>
                <p className="text-[11px] text-slate-400">
                  Hassle-free doorstep pickup
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  24/7 Expert Tech Support
                </p>
                <p className="text-[11px] text-slate-400">
                  Dedicated specialists across India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand & App Badges */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Shop<span className="text-accent-400">Sphere</span>
                <span className="text-xs font-bold text-primary-400">.in</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              India&apos;s premier destination for studio-grade audio, creator
              laptops, custom mechanical keyboards, smart wearables, and modern
              home essentials. Every order includes an official GST invoice and
              manufacturer warranty.
            </p>

            {/* Visual App Store Badges */}
            <div className="pt-1 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Experience ShopSphere on Mobile
              </p>
              <div className="flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-left select-none">
                  <Smartphone className="h-4 w-4 text-slate-300" />
                  <div className="leading-none">
                    <span className="block text-[9px] uppercase text-slate-400">
                      Download on the
                    </span>
                    <span className="text-xs font-bold text-white">
                      App Store
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-left select-none">
                  <Globe className="h-4 w-4 text-slate-300" />
                  <div className="leading-none">
                    <span className="block text-[9px] uppercase text-slate-400">
                      Get it on
                    </span>
                    <span className="text-xs font-bold text-white">
                      Google Play
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/products?category=audio-headphones"
                  className="hover:text-white transition-colors"
                >
                  Audio &amp; Headphones
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=laptops-computing"
                  className="hover:text-white transition-colors"
                >
                  Laptops &amp; Computing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smart-wearables"
                  className="hover:text-white transition-colors"
                >
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=ergonomic-workspace"
                  className="hover:text-white transition-colors"
                >
                  Ergonomic Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smart-home-coffee"
                  className="hover:text-white transition-colors"
                >
                  Smart Home &amp; Coffee
                </Link>
              </li>
              <li>
                <Link
                  href="/products?featured=true"
                  className="text-accent-400 font-semibold hover:text-accent-300 transition-colors"
                >
                  Deals of the Day
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/orders"
                  className="hover:text-white transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <span className="text-slate-400">7-Day Returns &amp; Exchanges</span>
              </li>
              <li>
                <span className="text-slate-400">Brand Warranty Claims</span>
              </li>
              <li>
                <span className="text-slate-400">Help Center &amp; FAQs</span>
              </li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              About ShopSphere
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  Authorized Brands
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Corporate &amp; Bulk Orders</span>
              </li>
              <li>
                <span className="text-slate-400">Press &amp; Media</span>
              </li>
              <li>
                <span className="text-slate-400">Careers at ShopSphere</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Policies */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Policies
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-400">Shipping &amp; Delivery Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Cancellation &amp; Refund</span>
              </li>
              <li>
                <span className="text-slate-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Terms of Sale</span>
              </li>
              <li>
                <span className="text-slate-400">E-Waste Recycling</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Social Row */}
        <div className="mt-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1">
              <CreditCard className="h-3.5 w-3.5 text-primary-400" />
              100% Secure Payments:
            </span>
            {[
              "UPI / BHIM",
              "Visa",
              "MasterCard",
              "RuPay",
              "NetBanking",
              "No-Cost EMI",
              "Pay on Delivery",
            ].map((method) => (
              <span
                key={method}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            <span>Toll-Free Support: </span>
            <strong className="text-white">1800-209-7467</strong>
            <span className="mx-2 text-slate-600">|</span>
            <span>care@shopsphere.in</span>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500 gap-2">
          <p>
            © {new Date().getFullYear()} ShopSphere Retail India Pvt. Ltd. All
            rights reserved. All prices in ₹ INR (incl. of all taxes).
          </p>
          <p className="text-slate-500">Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
