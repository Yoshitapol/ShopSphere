"use client";

// ============================================================================
// ShopSphere Interactive Product Search, Category & Price Filter Bar
// Experiment 2: Responsive Search Bar, Category Navigation & Price Filters
// ============================================================================
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
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
    router.push("/products");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      {/* Row 1: Search + Sort + Reset */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        className="grid grid-cols-1 gap-3 md:grid-cols-12"
      >
        <div className="relative md:col-span-5">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, brand, tag, or SKU..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:col-span-3">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ₹"
            aria-label="Minimum price in INR"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ₹"
            aria-label="Maximum price in INR"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              applyFilters({ sort: e.target.value });
            }}
            aria-label="Sort products"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset all filters"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Row 2: Category Pills + In-Stock Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              applyFilters({ category: "all" });
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              category === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.slug);
                applyFilters({ category: cat.slug });
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                category === cat.slug || category === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked);
              applyFilters({ inStock: e.target.checked });
            }}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          In-Stock Items Only
        </label>
      </div>
    </div>
  );
}
