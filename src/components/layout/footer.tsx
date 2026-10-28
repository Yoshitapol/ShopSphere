// ============================================================================
// ShopSphere Shared Footer Component
// Experiment 2: Responsive Footer with Category Navigation & Architecture Info
// ============================================================================
import React from "react";
import Link from "next/link";
import { ShoppingBag, Database, ShieldCheck, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Shop<span className="text-indigo-600">Sphere</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600">
              Full-stack e-commerce marketplace and inventory management platform
              integrating Next.js App Router, MySQL/Prisma, MongoDB/Mongoose,
              Better Auth OAuth, RBAC, and Docker.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                <Database className="h-3 w-3 text-indigo-600" />
                MySQL + Prisma
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                <Layers className="h-3 w-3 text-emerald-600" />
                MongoDB + Mongoose
              </span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Categories
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link
                  href="/products?category=audio-headphones"
                  className="hover:text-indigo-600 transition"
                >
                  Audio & Headphones
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=laptops-computing"
                  className="hover:text-indigo-600 transition"
                >
                  Laptops & Computing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smart-wearables"
                  className="hover:text-indigo-600 transition"
                >
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=ergonomic-workspace"
                  className="hover:text-indigo-600 transition"
                >
                  Ergonomic Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smart-home-coffee"
                  className="hover:text-indigo-600 transition"
                >
                  Smart Home & Coffee
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Application Routes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Application Routes
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/products" className="hover:text-indigo-600 transition">
                  Product Catalog (/products)
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-600 transition">
                  Shopping Cart (/cart)
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-indigo-600 transition">
                  Transactional Checkout (/checkout)
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-indigo-600 transition">
                  Customer Orders (/orders)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition">
                  Admin Control Panel (/dashboard)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition">
                  Better Auth Sign-In (/login)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Lab Experiments Integrated */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              10 Lab Experiments Integrated
            </h3>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
              <li>Exp 1-3: App Router, Tailwind UI & Nested Layouts</li>
              <li>Exp 4: REST Route Handlers & Server Actions + Zod</li>
              <li>Exp 5: MySQL, Prisma Relations & ACID Checkout</li>
              <li>Exp 6: MongoDB & Mongoose Catalog Schema</li>
              <li>Exp 7-8: Better Auth OAuth & Server RBAC</li>
              <li>Exp 9-10: Docker Compose & Env Security (`server-only`)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-500 gap-2">
          <p>
            © {new Date().getFullYear()} ShopSphere Full-Stack Mini-Project. All
            prices in Indian Rupees (₹ INR).
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            Simulated Checkout Mode — No Real Payment Gateway Charged
          </p>
        </div>
      </div>
    </footer>
  );
}
