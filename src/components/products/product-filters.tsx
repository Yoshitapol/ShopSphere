"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Check,
} from "lucide-react";
import type { CategoryRecord } from "@/types";

interface ProductFiltersProps {
  categories: CategoryRecord[];
  initialSearch?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialSort?: string;
  initialInStock?: boolean;
}

const PRICE_PRESETS = [
  { label: "Under ₹5,000", min: "", max: "5000" },
  { label: "₹5,000 – ₹15,000", min: "5000", max: "15000" },
  { label: "₹15,000 – ₹30,000", min: "15000", max: "30000" },
  { label: "Above ₹30,000", min: "30000", max: "" },
];

export function ProductFilters({
  categories,
  initialSearch = "",
  initialCategory = "all",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "featured",
  initialInStock = false,
}: ProductFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [inStock, setInStock] = useState(initialInStock);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const applyFilters = (overrides?: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: boolean;
  }) => {
    const nextSearch = overrides?.search ?? search;
    const nextCat = overrides?.category ?? category;
    const nextMin = overrides?.minPrice ?? minPrice;
    const nextMax = overrides?.maxPrice ?? maxPrice;
    const nextSort = overrides?.sort ?? sort;
    const nextStock = overrides?.inStock ?? inStock;

    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextCat && nextCat !== "all") params.set("category", nextCat);
    if (nextMin.trim()) params.set("minPrice", nextMin.trim());
    if (nextMax.trim()) params.set("maxPrice", nextMax.trim());
    if (nextSort && nextSort !== "featured") params.set("sort", nextSort);
    if (nextStock) params.set("inStock", "true");

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleReset = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
    setInStock(false);
    setMobileDrawerOpen(false);
    router.push("/products");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    (category && category !== "all") ||
    Boolean(minPrice.trim()) ||
    Boolean(maxPrice.trim()) ||
    inStock;

  const filterControlsContent = (
    <div className="space-y-6">
      {/* Header + Clear All */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-900">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Keyword Search within Catalog */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMobileDrawerOpen(false);
          applyFilters();
        }}
        className="space-y-2"
      >
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Keyword
        </label>
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Brand, model, feature..."
            aria-label="Search within results"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-ink-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white"
          />
        </div>
      </form>

      {/* Department / Category List */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Department
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setMobileDrawerOpen(false);
              applyFilters({ category: "all" });
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
              category === "all"
                ? "bg-primary-50 font-bold text-primary-700"
                : "text-ink-700 hover:bg-slate-100"
            }`}
          >
            <span>All Categories</span>
            {category === "all" && <Check className="h-3.5 w-3.5 text-primary-600" />}
          </button>

          {categories.map((cat) => {
            const active = category === cat.slug || category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.slug);
                  setMobileDrawerOpen(false);
                  applyFilters({ category: cat.slug });
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                  active
                    ? "bg-primary-50 font-bold text-primary-700"
                    : "text-ink-700 hover:bg-slate-100"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-primary-100 text-primary-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.productCount ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range (INR) */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Price Range (₹)
        </h3>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isSelected =
              minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setMinPrice(preset.min);
                  setMaxPrice(preset.max);
                  setMobileDrawerOpen(false);
                  applyFilters({ minPrice: preset.min, maxPrice: preset.max });
                }}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                  isSelected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min/Max Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="sr-only">Minimum price in INR</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min ₹"
              aria-label="Minimum price in INR"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-ink-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="sr-only">Maximum price in INR</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₹"
              aria-label="Maximum price in INR"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-ink-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMobileDrawerOpen(false);
            applyFilters();
          }}
          className="w-full rounded-lg bg-ink-900 px-3 py-2 text-xs font-bold text-white hover:bg-ink-800 transition"
        >
          Apply Price Filter
        </button>
      </div>

      {/* Availability Toggle */}
      <div className="border-t border-slate-100 pt-4">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-bold text-ink-800">
            Exclude Out of Stock
          </span>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked);
              setMobileDrawerOpen(false);
              applyFilters({ inStock: e.target.checked });
            }}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </div>

      {/* Sort Order */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <label
          htmlFor="sidebar-sort-select"
          className="block text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Sort By
        </label>
        <select
          id="sidebar-sort-select"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setMobileDrawerOpen(false);
            applyFilters({ sort: e.target.value });
          }}
          aria-label="Sort products"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-800 focus:border-primary-500 focus:bg-white"
        >
          <option value="featured">Featured &amp; Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter & Sort Bar */}
      <div className="flex lg:hidden items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-ink-800 hover:bg-slate-100"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary-600" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary-600" />
          )}
        </button>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            applyFilters({ sort: e.target.value });
          }}
          aria-label="Sort products mobile"
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-800"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-base font-extrabold text-ink-900">
                Filter &amp; Sort
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterControlsContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Left Sidebar Card */}
      <aside className="hidden lg:block rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card sticky top-28">
        {filterControlsContent}
      </aside>
    </>
  );
}
