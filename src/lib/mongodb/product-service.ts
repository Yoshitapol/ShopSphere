// ============================================================================
// ShopSphere Product Catalog & Category Service
// Experiment 6: MongoDB & Mongoose Catalog Operations
// Experiment 5: Cross-Database Sync with MySQL InventoryItem & Category
// Experiment 10: Protected with server-only
// ============================================================================
import "server-only";
import { connectToMongoDB, isMongoConnected } from "@/lib/mongodb/connect";
import { prisma, isMySqlConnected } from "@/lib/prisma/client";
import { readFallbackStore, writeFallbackStore } from "@/lib/fallback-store";
import { ProductModel, type IProductDocument } from "@models/Product";
import {
  slugify,
  type CategoryInput,
  type ProductInput,
} from "@/lib/validation/schemas";
import type {
  CategoryRecord,
  DatabaseHealthStatus,
  ProductCatalogItem,
} from "@/types";
import { getOAuthConfigurationStatus } from "@/lib/env";

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "rating" | "newest";
  featuredOnly?: boolean;
  inStockOnly?: boolean;
}

export class DuplicateResourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateResourceError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

function mapMongooseDocToCatalogItem(
  doc: IProductDocument,
  relationalStock?: {
    stockQuantity: number;
    reorderThreshold: number;
    unitPriceInr: number;
    categoryName?: string;
    categoryId?: string;
  }
): ProductCatalogItem {
  const stockQuantity =
    relationalStock !== undefined
      ? relationalStock.stockQuantity
      : doc.stockSnapshot;
  const reorderThreshold =
    relationalStock !== undefined
      ? relationalStock.reorderThreshold
      : doc.reorderThreshold;

  return {
    id: doc.catalogId,
    mongoId: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    sku: doc.sku,
    shortDescription: doc.shortDescription,
    description: doc.description,
    priceInr: relationalStock?.unitPriceInr ?? doc.priceInr,
    originalPriceInr: doc.originalPriceInr,
    images:
      Array.isArray(doc.images) && doc.images.length > 0
        ? doc.images
        : ["https://placehold.co/800x600/eef2ff/4f46e5?text=ShopSphere+Product"],
    categorySlug: doc.categorySlug,
    categoryName: relationalStock?.categoryName ?? doc.categoryName,
    categoryId: relationalStock?.categoryId ?? doc.categoryId,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    specifications: Array.isArray(doc.specifications)
      ? doc.specifications.map((s) => ({ label: s.label, value: s.value }))
      : [],
    stockQuantity,
    reorderThreshold,
    isAvailable: stockQuantity > 0 && doc.isAvailable,
    featured: Boolean(doc.featured),
    rating: doc.rating ?? 4.5,
    reviewCount: doc.reviewCount ?? 10,
    brand: doc.brand ?? "ShopSphere Originals",
    warranty: doc.warranty ?? "1 Year Manufacturer Warranty",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function getDatabaseHealthStatus(): Promise<DatabaseHealthStatus> {
  const [mysqlOk, mongoOk] = await Promise.all([
    isMySqlConnected(),
    isMongoConnected(),
  ]);
  const oauth = getOAuthConfigurationStatus();

  let mode: DatabaseHealthStatus["mode"] = "dev-fallback";
  if (mysqlOk && mongoOk) {
    mode = "hybrid-live";
  } else if (mysqlOk || mongoOk) {
    mode = "partial-live";
  }

  return {
    mysqlConnected: mysqlOk,
    mongoConnected: mongoOk,
    mode,
    mysqlMessage: mysqlOk
      ? "Connected to MySQL (Prisma Transactional Engine Active)"
      : "MySQL offline — using persistent disk fallback (.data/shopsphere-store.json)",
    mongoMessage: mongoOk
      ? "Connected to MongoDB (Mongoose Catalog Engine Active)"
      : "MongoDB offline — using persistent disk fallback (.data/shopsphere-store.json)",
    oauthConfigured: {
      google: oauth.googleConfigured,
      github: oauth.githubConfigured,
    },
  };
}

/**
 * Lists all categories from MySQL (or persistent fallback if offline)
 * with live product counts.
 */
export async function listCategories(): Promise<CategoryRecord[]> {
  const store = readFallbackStore();
  const mysqlOk = await isMySqlConnected();

  if (mysqlOk) {
    try {
      const dbCategories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { inventory: true },
          },
        },
      });
      if (dbCategories.length > 0) {
        return dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          iconName: c.iconName,
          isActive: c.isActive,
          productCount: c._count.inventory,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback below
    }
  }

  return store.categories.map((cat) => ({
    ...cat,
    productCount: store.products.filter(
      (p) => p.categoryId === cat.id || p.categorySlug === cat.slug
    ).length,
  }));
}

/**
 * Creates a new Category in MySQL (and updates the persistent disk store).
 */
export async function createCategory(input: CategoryInput): Promise<CategoryRecord> {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  const store = readFallbackStore();

  const duplicateInStore = store.categories.find(
    (c) =>
      c.slug.toLowerCase() === slug.toLowerCase() ||
      c.name.toLowerCase() === input.name.toLowerCase()
  );

  const mysqlOk = await isMySqlConnected();
  if (mysqlOk) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { name: input.name }],
      },
    });
    if (existing) {
      throw new DuplicateResourceError(
        `A category with name "${input.name}" or slug "${slug}" already exists.`
      );
    }

    const created = await prisma.category.create({
      data: {
        id: `cat_${slug.replace(/-/g, "_")}_${Date.now().toString().slice(-4)}`,
        name: input.name,
        slug,
        description: input.description,
        iconName: input.iconName || "Package",
        isActive: input.isActive ?? true,
      },
    });

    const record: CategoryRecord = {
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
      iconName: created.iconName,
      isActive: created.isActive,
      productCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    store.categories.push(record);
    writeFallbackStore(store);
    return record;
  }

  if (duplicateInStore) {
    throw new DuplicateResourceError(
      `A category with name "${input.name}" or slug "${slug}" already exists.`
    );
  }

  const now = new Date().toISOString();
  const record: CategoryRecord = {
    id: `cat_${slug.replace(/-/g, "_")}_${Date.now().toString().slice(-4)}`,
    name: input.name,
    slug,
    description: input.description,
    iconName: input.iconName || "Package",
    isActive: input.isActive ?? true,
    productCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  store.categories.push(record);
  writeFallbackStore(store);
  return record;
}

/**
 * Lists products from MongoDB (joined with MySQL InventoryItem stock when online)
 * or from the persistent disk fallback store when MongoDB is unreachable.
 */
export async function listProducts(
  filters: ProductFilterOptions = {}
): Promise<ProductCatalogItem[]> {
  let items: ProductCatalogItem[] = [];
  const mongoOk = await isMongoConnected();
  const mysqlOk = await isMySqlConnected();

  if (mongoOk) {
    try {
      await connectToMongoDB();
      const docs = await ProductModel.find({}).sort({ createdAt: -1 });
      if (docs.length > 0) {
        const inventoryMap = new Map<
          string,
          {
            stockQuantity: number;
            reorderThreshold: number;
            unitPriceInr: number;
            categoryName?: string;
            categoryId?: string;
          }
        >();

        if (mysqlOk) {
          const invRecords = await prisma.inventoryItem.findMany({
            include: { category: true },
          });
          for (const inv of invRecords) {
            inventoryMap.set(inv.catalogProductId, {
              stockQuantity: inv.stockQuantity,
              reorderThreshold: inv.reorderThreshold,
              unitPriceInr: inv.unitPriceInr,
              categoryName: inv.category?.name,
              categoryId: inv.categoryId,
            });
          }
        }

        items = docs.map((doc) =>
          mapMongooseDocToCatalogItem(doc, inventoryMap.get(doc.catalogId))
        );
      }
    } catch {
      // Fallback handled below
    }
  }

  if (items.length === 0) {
    const store = readFallbackStore();
    items = [...store.products];
  }

  // Apply search, category, price, stock, and sorting filters
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (
    filters.category &&
    filters.category !== "all" &&
    filters.category.trim() !== ""
  ) {
    const catFilter = filters.category.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.categorySlug.toLowerCase() === catFilter ||
        p.categoryId.toLowerCase() === catFilter
    );
  }

  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    items = items.filter((p) => p.priceInr >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    items = items.filter((p) => p.priceInr <= filters.maxPrice!);
  }

  if (filters.featuredOnly) {
    items = items.filter((p) => p.featured);
  }

  if (filters.inStockOnly) {
    items = items.filter((p) => p.stockQuantity > 0);
  }

  switch (filters.sort) {
    case "price-asc":
      items.sort((a, b) => a.priceInr - b.priceInr);
      break;
    case "price-desc":
      items.sort((a, b) => b.priceInr - a.priceInr);
      break;
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "featured":
    default:
      items.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.rating - a.rating;
      });
      break;
  }

  return items;
}

/**
 * Retrieves a single product by its `catalogProductId` (`id`), `slug`, or MongoDB `_id`.
 */
export async function getProductByIdOrSlug(
  identifier: string
): Promise<ProductCatalogItem | null> {
  const cleanId = decodeURIComponent(identifier).trim();
  const mongoOk = await isMongoConnected();
  const mysqlOk = await isMySqlConnected();

  if (mongoOk) {
    try {
      await connectToMongoDB();
      const doc = await ProductModel.findOne({
        $or: [
          { catalogId: cleanId },
          { slug: cleanId.toLowerCase() },
          { sku: cleanId.toUpperCase() },
        ],
      });

      if (doc) {
        let relationalStock:
          | {
              stockQuantity: number;
              reorderThreshold: number;
              unitPriceInr: number;
              categoryName?: string;
              categoryId?: string;
            }
          | undefined;

        if (mysqlOk) {
          const inv = await prisma.inventoryItem.findUnique({
            where: { catalogProductId: doc.catalogId },
            include: { category: true },
          });
          if (inv) {
            relationalStock = {
              stockQuantity: inv.stockQuantity,
              reorderThreshold: inv.reorderThreshold,
              unitPriceInr: inv.unitPriceInr,
              categoryName: inv.category?.name,
              categoryId: inv.categoryId,
            };
          }
        }
        return mapMongooseDocToCatalogItem(doc, relationalStock);
      }
    } catch {
      // Fallback below
    }
  }

  const store = readFallbackStore();
  const found = store.products.find(
    (p) =>
      p.id === cleanId ||
      p.slug.toLowerCase() === cleanId.toLowerCase() ||
      p.sku.toUpperCase() === cleanId.toUpperCase()
  );

  return found ?? null;
}

/**
 * Creates a new product in MongoDB (Mongoose catalog) AND creates the corresponding
 * relational InventoryItem in MySQL (Prisma) with a shared stable `catalogProductId`.
 */
export async function createProduct(
  input: ProductInput
): Promise<ProductCatalogItem> {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  const sku = input.sku.trim().toUpperCase();
  const catalogId = `prod_${slug.replace(/-/g, "_").slice(0, 24)}_${Date.now()
    .toString()
    .slice(-4)}`;

  const categories = await listCategories();
  const category =
    categories.find(
      (c) => c.id === input.categoryId || c.slug === input.categoryId
    ) ?? categories[0];

  if (!category) {
    throw new ResourceNotFoundError("Selected product category does not exist.");
  }

  const store = readFallbackStore();
  const duplicateInStore = store.products.find(
    (p) =>
      p.slug.toLowerCase() === slug.toLowerCase() ||
      p.sku.toUpperCase() === sku
  );

  const mongoOk = await isMongoConnected();
  const mysqlOk = await isMySqlConnected();

  if (mongoOk) {
    await connectToMongoDB();
    const existingDoc = await ProductModel.findOne({
      $or: [{ slug }, { sku }],
    });
    if (existingDoc) {
      throw new DuplicateResourceError(
        `A product with slug "${slug}" or SKU "${sku}" already exists in MongoDB.`
      );
    }
  } else if (duplicateInStore) {
    throw new DuplicateResourceError(
      `A product with slug "${slug}" or SKU "${sku}" already exists.`
    );
  }

  if (mysqlOk) {
    const existingInv = await prisma.inventoryItem.findFirst({
      where: {
        OR: [{ catalogProductId: catalogId }, { sku }],
      },
    });
    if (existingInv) {
      throw new DuplicateResourceError(
        `An inventory record with SKU "${sku}" already exists in MySQL.`
      );
    }
  }

  const now = new Date().toISOString();
  const newProduct: ProductCatalogItem = {
    id: catalogId,
    name: input.name,
    slug,
    sku,
    shortDescription: input.shortDescription,
    description: input.description,
    priceInr: input.priceInr,
    originalPriceInr: input.originalPriceInr ?? undefined,
    images: input.images,
    categorySlug: category.slug,
    categoryName: category.name,
    categoryId: category.id,
    tags: input.tags ?? [],
    specifications: input.specifications ?? [],
    stockQuantity: input.stockQuantity,
    reorderThreshold: input.reorderThreshold ?? 5,
    isAvailable: input.stockQuantity > 0,
    featured: Boolean(input.featured),
    rating: 4.7,
    reviewCount: 1,
    brand: input.brand || "ShopSphere Originals",
    warranty: input.warranty || "1 Year Manufacturer Warranty",
    createdAt: now,
    updatedAt: now,
  };

  if (mongoOk) {
    await ProductModel.create({
      catalogId: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      sku: newProduct.sku,
      shortDescription: newProduct.shortDescription,
      description: newProduct.description,
      priceInr: newProduct.priceInr,
      originalPriceInr: newProduct.originalPriceInr,
      images: newProduct.images,
      categorySlug: newProduct.categorySlug,
      categoryName: newProduct.categoryName,
      categoryId: newProduct.categoryId,
      tags: newProduct.tags,
      specifications: newProduct.specifications,
      brand: newProduct.brand,
      warranty: newProduct.warranty,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      featured: newProduct.featured,
      stockSnapshot: newProduct.stockQuantity,
      reorderThreshold: newProduct.reorderThreshold,
      isAvailable: newProduct.isAvailable,
    });
  }

  if (mysqlOk) {
    await prisma.inventoryItem.create({
      data: {
        id: `inv_${newProduct.id}`,
        catalogProductId: newProduct.id,
        sku: newProduct.sku,
        productName: newProduct.name,
        unitPriceInr: newProduct.priceInr,
        stockQuantity: newProduct.stockQuantity,
        reorderThreshold: newProduct.reorderThreshold,
        isAvailable: newProduct.isAvailable,
        categoryId: category.id,
      },
    });
  }

  // Always keep local persistent disk store synchronized
  store.products.unshift(newProduct);
  writeFallbackStore(store);

  return newProduct;
}

/**
 * Updates an existing product in MongoDB (Mongoose) and synchronizes relational
 * inventory/price/category fields in MySQL (Prisma).
 */
export async function updateProduct(
  identifier: string,
  input: Partial<ProductInput>
): Promise<ProductCatalogItem> {
  const existing = await getProductByIdOrSlug(identifier);
  if (!existing) {
    throw new ResourceNotFoundError(`Product "${identifier}" was not found.`);
  }

  const categories = await listCategories();
  const category = input.categoryId
    ? categories.find(
        (c) => c.id === input.categoryId || c.slug === input.categoryId
      )
    : categories.find((c) => c.id === existing.categoryId);

  const nextSlug = input.slug
    ? slugify(input.slug)
    : input.name && input.name !== existing.name
    ? slugify(input.name)
    : existing.slug;
  const nextSku = input.sku ? input.sku.trim().toUpperCase() : existing.sku;

  const store = readFallbackStore();
  const conflicting = store.products.find(
    (p) =>
      p.id !== existing.id &&
      (p.slug.toLowerCase() === nextSlug.toLowerCase() ||
        p.sku.toUpperCase() === nextSku)
  );
  if (conflicting) {
    throw new DuplicateResourceError(
      `Another product already uses slug "${nextSlug}" or SKU "${nextSku}".`
    );
  }

  const nextStock =
    typeof input.stockQuantity === "number"
      ? input.stockQuantity
      : existing.stockQuantity;

  const updated: ProductCatalogItem = {
    ...existing,
    name: input.name ?? existing.name,
    slug: nextSlug,
    sku: nextSku,
    shortDescription: input.shortDescription ?? existing.shortDescription,
    description: input.description ?? existing.description,
    priceInr:
      typeof input.priceInr === "number" ? input.priceInr : existing.priceInr,
    originalPriceInr:
      input.originalPriceInr !== undefined
        ? input.originalPriceInr ?? undefined
        : existing.originalPriceInr,
    images:
      input.images && input.images.length > 0 ? input.images : existing.images,
    categoryId: category?.id ?? existing.categoryId,
    categoryName: category?.name ?? existing.categoryName,
    categorySlug: category?.slug ?? existing.categorySlug,
    tags: input.tags ?? existing.tags,
    specifications: input.specifications ?? existing.specifications,
    stockQuantity: nextStock,
    reorderThreshold:
      typeof input.reorderThreshold === "number"
        ? input.reorderThreshold
        : existing.reorderThreshold,
    isAvailable: nextStock > 0,
    featured:
      typeof input.featured === "boolean" ? input.featured : existing.featured,
    brand: input.brand ?? existing.brand,
    warranty: input.warranty ?? existing.warranty,
    updatedAt: new Date().toISOString(),
  };

  const mongoOk = await isMongoConnected();
  const mysqlOk = await isMySqlConnected();

  if (mongoOk) {
    await connectToMongoDB();
    await ProductModel.findOneAndUpdate(
      { catalogId: existing.id },
      {
        name: updated.name,
        slug: updated.slug,
        sku: updated.sku,
        shortDescription: updated.shortDescription,
        description: updated.description,
        priceInr: updated.priceInr,
        originalPriceInr: updated.originalPriceInr,
        images: updated.images,
        categorySlug: updated.categorySlug,
        categoryName: updated.categoryName,
        categoryId: updated.categoryId,
        tags: updated.tags,
        specifications: updated.specifications,
        brand: updated.brand,
        warranty: updated.warranty,
        featured: updated.featured,
        stockSnapshot: updated.stockQuantity,
        reorderThreshold: updated.reorderThreshold,
        isAvailable: updated.isAvailable,
      },
      { new: true, runValidators: true }
    );
  }

  if (mysqlOk) {
    await prisma.inventoryItem.upsert({
      where: { catalogProductId: existing.id },
      update: {
        sku: updated.sku,
        productName: updated.name,
        unitPriceInr: updated.priceInr,
        stockQuantity: updated.stockQuantity,
        reorderThreshold: updated.reorderThreshold,
        isAvailable: updated.isAvailable,
        categoryId: updated.categoryId,
      },
      create: {
        id: `inv_${existing.id}`,
        catalogProductId: existing.id,
        sku: updated.sku,
        productName: updated.name,
        unitPriceInr: updated.priceInr,
        stockQuantity: updated.stockQuantity,
        reorderThreshold: updated.reorderThreshold,
        isAvailable: updated.isAvailable,
        categoryId: updated.categoryId,
      },
    });
  }

  const idx = store.products.findIndex((p) => p.id === existing.id);
  if (idx >= 0) {
    store.products[idx] = updated;
  } else {
    store.products.unshift(updated);
  }
  writeFallbackStore(store);

  return updated;
}

/**
 * Deletes a product from MongoDB catalog and removes its MySQL InventoryItem
 * (unless referenced by existing historical OrderItems, in which case it safely archives/removes catalog entry).
 */
export async function deleteProduct(
  identifier: string
): Promise<{ deletedId: string; name: string }> {
  const existing = await getProductByIdOrSlug(identifier);
  if (!existing) {
    throw new ResourceNotFoundError(`Product "${identifier}" was not found.`);
  }

  const mongoOk = await isMongoConnected();
  const mysqlOk = await isMySqlConnected();

  if (mongoOk) {
    await connectToMongoDB();
    await ProductModel.deleteOne({ catalogId: existing.id });
  }

  if (mysqlOk) {
    try {
      await prisma.inventoryItem.delete({
        where: { catalogProductId: existing.id },
      });
    } catch {
      // If referenced by historical OrderItems (ON DELETE RESTRICT), mark stock=0 & unavailable
      await prisma.inventoryItem
        .update({
          where: { catalogProductId: existing.id },
          data: { stockQuantity: 0, isAvailable: false },
        })
        .catch(() => {});
    }
  }

  const store = readFallbackStore();
  store.products = store.products.filter((p) => p.id !== existing.id);
  writeFallbackStore(store);

  return { deletedId: existing.id, name: existing.name };
}
