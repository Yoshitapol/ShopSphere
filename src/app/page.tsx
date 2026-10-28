import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Laptop,
  Watch,
  Keyboard,
  Coffee,
  Sparkles,
  Flame,
  Package,
  BadgePercent,
  CheckCircle2,
} from "lucide-react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductCard } from "@/components/products/product-card";
import { ProductImage } from "@/components/ui/product-image";
import { NewsletterBand, StarRating } from "@/components/ui/storefront-helpers";
import {
  getDatabaseHealthStatus,
  listCategories,
  listProducts,
} from "@/lib/mongodb/product-service";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { calculateDiscountPercent, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function getCategoryVisual(slug: string) {
  switch (slug) {
    case "audio-headphones":
      return {
        icon: Headphones,
        color: "bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white",
        tagline: "ANC Headphones, Earbuds & Studio Monitors",
      };
    case "laptops-computing":
      return {
        icon: Laptop,
        color: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        tagline: "Creator Ultrabooks, NVMe Docks & Displays",
      };
    case "smart-wearables":
      return {
        icon: Watch,
        color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        tagline: "AMOLED Fitness Watches & Health Trackers",
      };
    case "ergonomic-workspace":
      return {
        icon: Keyboard,
        color: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
        tagline: "Mechanical Keyboards, Chairs & Desk Gear",
      };
    case "smart-home-coffee":
      return {
        icon: Coffee,
        color: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        tagline: "Barista Espresso Machines & Air Purifiers",
      };
    default:
      return {
        icon: Package,
        color: "bg-slate-100 text-ink-700 group-hover:bg-primary-600 group-hover:text-white",
        tagline: "Curated Electronics & Lifestyle Essentials",
      };
  }
}

export default async function HomePage() {
  const [allProducts, categories, _health, _user] = await Promise.all([
    listProducts({ sort: "featured" }),
    listCategories(),
    getDatabaseHealthStatus(),
    getCurrentUser(),
  ]);
  void _health;
  void _user;

  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
  const catalogPreview = allProducts.slice(0, 8);
  const heroSpotlight = featuredProducts[0] ?? allProducts[0];
  const secondarySpotlights = featuredProducts.slice(1, 3);

  return (
    <StorefrontLayout>
      {/* Full-Width Promotional Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-primary-950 text-white">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-accent-300 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent-400" />
                <span>Big Tech Festival Sale • Up to 30% Off + No-Cost EMI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Upgrade Your Everyday{" "}
                <span className="bg-gradient-to-r from-primary-300 via-white to-accent-300 bg-clip-text text-transparent">
                  Sound, Work &amp; Living
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Discover flagship wireless ANC headphones, OLED creator laptops,
                custom mechanical keyboards, and smart home essentials from top
                brands — delivered fast to your doorstep with official brand
                warranty.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-600 active:scale-[0.99] transition"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/15 transition"
                >
                  <BadgePercent className="h-4 w-4 text-accent-400" />
                  <span>View Deals</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  100% Genuine Products
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  GST Invoice Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Instant UPI &amp; Card Offers
                </span>
              </div>
            </div>

            {/* Right Product Spotlight Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {heroSpotlight && (
                <Link
                  href={`/products/${heroSpotlight.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md hover:bg-white/15 transition"
                >
                  <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-white p-2">
                    <ProductImage
                      src={heroSpotlight.images[0]}
                      alt={heroSpotlight.name}
                      fit="contain"
                      className="h-full w-full group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="inline-block rounded-md bg-accent-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      Spotlight Deal
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-accent-300 transition-colors">
                      {heroSpotlight.name}
                    </h2>
                    <StarRating
                      rating={heroSpotlight.rating}
                      reviewCount={heroSpotlight.reviewCount}
                    />
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-lg font-extrabold text-white">
                        {formatInr(heroSpotlight.priceInr)}
                      </span>
                      {heroSpotlight.originalPriceInr && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatInr(heroSpotlight.originalPriceInr)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {secondarySpotlights.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {secondarySpotlights.map((item) => {
                    const disc = calculateDiscountPercent(
                      item.priceInr,
                      item.originalPriceInr
                    );
                    return (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="group rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur hover:bg-white/10 transition flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white p-1.5">
                            <ProductImage
                              src={item.images[0]}
                              alt={item.name}
                              fit="contain"
                              className="h-full w-full group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            {disc > 0 && (
                              <span className="text-[10px] font-extrabold text-emerald-400">
                                Save {disc}%
                              </span>
                            )}
                            <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-accent-300 transition-colors">
                              {item.name}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                          <span className="font-extrabold text-white">
                            {formatInr(item.priceInr)}
                          </span>
                          <span className="text-[11px] font-semibold text-accent-300">
                            Shop →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Trust Strip Directly Below Hero */}
      <section className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-900">
                  Free Express Shipping
                </p>
                <p className="text-[11px] text-slate-500">
                  On all orders above ₹2,000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-900">
                  100% Secure Payments
                </p>
                <p className="text-[11px] text-slate-500">
                  UPI, Cards, NetBanking &amp; COD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-900">
                  Easy 7-Day Returns
                </p>
                <p className="text-[11px] text-slate-500">
                  Instant replacement guarantee
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-900">
                  24/7 Customer Support
                </p>
                <p className="text-[11px] text-slate-500">
                  Expert assistance anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Shop by Category
            </span>
            <h2 className="text-2xl font-extrabold text-ink-900 mt-0.5">
              Explore Top Departments
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            Browse all categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => {
            const visual = getCategoryVisual(cat.slug);
            const IconComponent = visual.icon;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-card hover:border-primary-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${visual.color}`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {visual.tagline}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-primary-600">
                  <span>{cat.productCount ?? 0} Products</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Deals of the Day / Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600">
                    Limited-Time Offers
                  </span>
                  <span className="rounded-md bg-accent-50 border border-accent-200 px-2 py-0.5 text-[10px] font-bold text-accent-700">
                    Ends Tonight
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-ink-900">
                  Deals of the Day
                </h2>
              </div>
            </div>

            <Link
              href="/products?featured=true"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              See all featured deals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trending / All Products Section */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Customer Favorites
            </span>
            <h2 className="text-2xl font-extrabold text-ink-900 mt-0.5">
              Trending Across India
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-ink-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            View All ({allProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {catalogPreview.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Signup Band */}
      <NewsletterBand />
    </StorefrontLayout>
  );
}
