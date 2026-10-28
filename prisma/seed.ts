// ============================================================================
// ShopSphere Unified Database Seeder (MySQL via Prisma + MongoDB via Mongoose)
// Experiment 5: Prisma Relational Seeding (Users, Categories, InventoryItems, Orders)
// Experiment 6: Mongoose Catalog Seeding (Products with Embedded Specifications)
// Run with: npm run db:seed
// ============================================================================
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { ProductModel } from "../models/Product";
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function seedMySQL() {
  console.log("🐬 [MySQL / Prisma] Connecting to relational database...");
  await Promise.race([
    prisma.$queryRaw`SELECT 1`,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MySQL connection timeout (2.5s)")), 2500)
    ),
  ]);

  console.log("🐬 [MySQL / Prisma] Seeding Users & Roles...");
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        phone: user.phone ?? null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
        role: user.role,
        phone: user.phone ?? null,
      },
    });
  }

  console.log("🐬 [MySQL / Prisma] Seeding Categories...");
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        iconName: cat.iconName,
        isActive: cat.isActive,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconName: cat.iconName,
        isActive: cat.isActive,
      },
    });
  }

  console.log(
    "🐬 [MySQL / Prisma] Seeding InventoryItems (cross-DB linked via catalogProductId)..."
  );
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.inventoryItem.upsert({
      where: { catalogProductId: prod.id },
      update: {
        sku: prod.sku,
        productName: prod.name,
        unitPriceInr: prod.priceInr,
        stockQuantity: prod.stockQuantity,
        reorderThreshold: prod.reorderThreshold,
        isAvailable: prod.isAvailable && prod.stockQuantity > 0,
        categoryId: prod.categoryId,
      },
      create: {
        id: `inv_${prod.id}`,
        catalogProductId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        unitPriceInr: prod.priceInr,
        stockQuantity: prod.stockQuantity,
        reorderThreshold: prod.reorderThreshold,
        isAvailable: prod.isAvailable && prod.stockQuantity > 0,
        categoryId: prod.categoryId,
      },
    });
  }

  console.log("🐬 [MySQL / Prisma] Seeding Sample Orders & OrderItems...");
  for (const ord of INITIAL_ORDERS) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: ord.orderNumber },
    });
    if (!existing) {
      await prisma.order.create({
        data: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          userId: ord.userId,
          status: ord.status,
          paymentStatus: ord.paymentStatus,
          paymentMethod: ord.paymentMethod,
          subtotalInr: ord.subtotalInr,
          taxInr: ord.taxInr,
          shippingInr: ord.shippingInr,
          totalInr: ord.totalInr,
          recipientName: ord.recipientName,
          recipientEmail: ord.recipientEmail,
          recipientPhone: ord.recipientPhone,
          shippingAddress: ord.shippingAddress,
          shippingCity: ord.shippingCity,
          shippingState: ord.shippingState,
          shippingPincode: ord.shippingPincode,
          notes: ord.notes ?? null,
          items: {
            create: ord.items.map((item) => ({
              id: item.id,
              inventoryItemId: item.inventoryItemId,
              catalogProductId: item.catalogProductId,
              productName: item.productName,
              productSlug: item.productSlug,
              productImage: item.productImage,
              sku: item.sku,
              quantity: item.quantity,
              unitPriceInr: item.unitPriceInr,
              lineTotalInr: item.lineTotalInr,
            })),
          },
        },
      });
    }
  }

  console.log("✅ [MySQL / Prisma] Relational seed completed successfully.");
}

async function seedMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in environment.");
  }

  console.log("🍃 [MongoDB / Mongoose] Connecting to document catalog database...");
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 2500,
    connectTimeoutMS: 2500,
  });

  console.log("🍃 [MongoDB / Mongoose] Upserting Product catalog documents...");
  for (const prod of INITIAL_PRODUCTS) {
    await ProductModel.findOneAndUpdate(
      { catalogId: prod.id },
      {
        catalogId: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        priceInr: prod.priceInr,
        originalPriceInr: prod.originalPriceInr,
        images: prod.images,
        categorySlug: prod.categorySlug,
        categoryName: prod.categoryName,
        categoryId: prod.categoryId,
        tags: prod.tags,
        specifications: prod.specifications,
        brand: prod.brand,
        warranty: prod.warranty,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        featured: prod.featured,
        stockSnapshot: prod.stockQuantity,
        reorderThreshold: prod.reorderThreshold,
        isAvailable: prod.isAvailable && prod.stockQuantity > 0,
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  console.log("✅ [MongoDB / Mongoose] Catalog seed completed successfully.");
}

function seedLocalPersistentFallback() {
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const storePath = path.join(dataDir, "shopsphere-store.json");
  const initialStore = {
    seededAt: new Date().toISOString(),
    users: INITIAL_USERS,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
  };
  fs.writeFileSync(storePath, JSON.stringify(initialStore, null, 2), "utf8");
  console.log(
    `💾 [Local Fallback Store] Initialized persistent disk store at ${storePath}`
  );
}

async function main() {
  console.log("============================================================");
  console.log("🚀 ShopSphere Database Seeder Starting...");
  console.log("============================================================");

  // Always initialize the local persistent fallback file so local dev works offline
  seedLocalPersistentFallback();

  let mysqlSuccess = false;
  let mongoSuccess = false;

  try {
    await seedMySQL();
    mysqlSuccess = true;
  } catch (err) {
    console.warn(
      "⚠️  [MySQL / Prisma] Could not reach live MySQL instance:",
      err instanceof Error ? err.message : String(err)
    );
    console.warn(
      "   -> Start Docker Compose (`docker compose up -d mysql`) or local MySQL and re-run `npm run db:seed`."
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  try {
    await seedMongoDB();
    mongoSuccess = true;
  } catch (err) {
    console.warn(
      "⚠️  [MongoDB / Mongoose] Could not reach live MongoDB instance:",
      err instanceof Error ? err.message : String(err)
    );
    console.warn(
      "   -> Start Docker Compose (`docker compose up -d mongodb`) or local MongoDB and re-run `npm run db:seed`."
    );
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
  }

  console.log("============================================================");
  console.log(
    `📊 Seed Summary: MySQL=${mysqlSuccess ? "SEEDED" : "OFFLINE (Fallback Ready)"} | MongoDB=${mongoSuccess ? "SEEDED" : "OFFLINE (Fallback Ready)"}`
  );
  console.log("============================================================");
}

main().catch((err) => {
  console.error("Unexpected error in seed script:", err);
  process.exit(1);
});
