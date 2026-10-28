// ============================================================================
// ShopSphere Persistent Disk Fallback Store (.data/shopsphere-store.json)
// Explicitly labeled Development Fallback used ONLY when live MySQL or
// MongoDB services are unreachable on the host machine.
// Persists all CRUD mutations, stock decrements, and orders to disk.
// ============================================================================
import "server-only";
import fs from "fs";
import path from "path";
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from "@/lib/seed-data";
import type {
  AppUser,
  CategoryRecord,
  OrderRecord,
  ProductCatalogItem,
} from "@/types";

export interface PersistentFallbackData {
  seededAt: string;
  users: AppUser[];
  categories: CategoryRecord[];
  products: ProductCatalogItem[];
  orders: OrderRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "shopsphere-store.json");

function ensureStoreExists(): PersistentFallbackData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: PersistentFallbackData = {
        seededAt: new Date().toISOString(),
        users: INITIAL_USERS,
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: INITIAL_ORDERS,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as PersistentFallbackData;
    return {
      seededAt: parsed.seededAt ?? new Date().toISOString(),
      users: Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS,
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : INITIAL_CATEGORIES,
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
      orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
    };
  } catch {
    return {
      seededAt: new Date().toISOString(),
      users: [...INITIAL_USERS],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      orders: [...INITIAL_ORDERS],
    };
  }
}

export function readFallbackStore(): PersistentFallbackData {
  return ensureStoreExists();
}

export function writeFallbackStore(data: PersistentFallbackData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write fallback store to disk:", err);
  }
}

export function resetFallbackStore(): PersistentFallbackData {
  const initial: PersistentFallbackData = {
    seededAt: new Date().toISOString(),
    users: INITIAL_USERS,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
  };
  writeFallbackStore(initial);
  return initial;
}
