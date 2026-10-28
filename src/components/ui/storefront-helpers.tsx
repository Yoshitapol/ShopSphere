"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Star,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useToast } from "@/components/ui/toast-provider";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 overflow-x-auto py-1">
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink-900 truncate max-w-[220px] sm:max-w-xs">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const fullStars = Math.round(rating);
  const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="inline-flex items-center gap-0.5"
        aria-label={`Rated ${rating.toFixed(1)} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= fullStars
                ? "fill-warning-400 text-warning-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-ink-800">{rating.toFixed(1)}</span>
      {typeof reviewCount === "number" && (
        <span className="text-xs text-slate-400">
          ({reviewCount.toLocaleString("en-IN")})
        </span>
      )}
    </div>
  );
}

export function ProductGallery({
  images,
  productName,
  discount,
}: {
  images: string[];
  productName: string;
  discount?: number;
}) {
  const safeImages = images.length > 0 ? images : [""];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
        {discount && discount > 0 ? (
          <span className="absolute top-4 left-4 z-10 rounded-lg bg-success-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        ) : null}
        <ProductImage
          src={safeImages[activeIndex] ?? safeImages[0]}
          alt={productName}
          fit="contain"
          className="h-full w-full transition-transform duration-300 hover:scale-105"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1} of ${productName}`}
              className={`aspect-square overflow-hidden rounded-xl border bg-white p-1.5 transition-all ${
                activeIndex === idx
                  ? "border-primary-600 ring-2 ring-primary-500/20"
                  : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fit="contain"
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NewsletterBand() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    setSubscribed(true);
    setEmail("");
    showToast("You're subscribed! Watch your inbox for member-only deals.", "success");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-950 via-ink-900 to-primary-950 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-card-hover">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ShopSphere Insider Club</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Get ₹500 off your first order &amp; early access to flash deals
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Join 45,000+ tech enthusiasts across India receiving weekly drops on flagship audio, creator laptops, and custom workspace gear. No spam, unsubscribe anytime.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  Welcome to ShopSphere Insider! Use code{" "}
                  <strong className="font-mono text-white">FIRST500</strong> at checkout.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="relative flex-1">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    aria-label="Email address for newsletter"
                    className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary-400 focus:bg-white/15 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-accent-600 active:scale-[0.99] transition"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              By subscribing you agree to our Privacy Policy and Terms of Offer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse"
        >
          <div className="aspect-square w-full rounded-lg bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="pt-2 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-slate-100" />
            <div className="h-9 w-28 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
