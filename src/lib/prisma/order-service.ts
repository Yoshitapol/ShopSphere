// ============================================================================
// ShopSphere Transactional Order & Analytics Service (MySQL / Prisma)
// Experiment 5: Prisma Relationships, Referential Integrity & ACID Transactions
// Experiment 8: Strict Ownership Verification on Order Retrieval
// Experiment 10: Protected with server-only
// ============================================================================
import "server-only";
import { prisma, isMySqlConnected } from "@/lib/prisma/client";
import { connectToMongoDB, isMongoConnected } from "@/lib/mongodb/connect";
import { ProductModel } from "@models/Product";
import { readFallbackStore, writeFallbackStore } from "@/lib/fallback-store";
import {
  getProductByIdOrSlug,
  listCategories,
  listProducts,
  ResourceNotFoundError,
} from "@/lib/mongodb/product-service";
import type { CheckoutInput } from "@/lib/validation/schemas";
import type {
  AppUser,
  DashboardAnalytics,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
} from "@/types";

export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class ForbiddenOrderAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenOrderAccessError";
  }
}

function generateOrderNumber(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `SPH-2026-${randomDigits}`;
}

/**
 * Experiment 5: Real MySQL ACID Checkout Transaction
 * 1. Validates cart items and quantities.
 * 2. Verifies product references and available stock in MySQL InventoryItem.
 * 3. Creates the Order and OrderItems using server-verified prices.
 * 4. Decrements relational InventoryItem stock quantities atomically.
 * 5. Commits only when all operations succeed; then updates MongoDB stockSnapshot.
 */
export async function executeTransactionalCheckout(
  user: AppUser,
  input: CheckoutInput
): Promise<OrderRecord> {
  const mysqlOk = await isMySqlConnected();
  const mongoOk = await isMongoConnected();
  const store = readFallbackStore();

  // Resolve product catalog details for each requested item
  const resolvedCatalogProducts = await Promise.all(
    input.items.map(async (item) => {
      const product = await getProductByIdOrSlug(item.catalogProductId);
      if (!product) {
        throw new ResourceNotFoundError(
          `Product "${item.catalogProductId}" no longer exists in the catalog.`
        );
      }
      return {
        product,
        quantity: item.quantity,
      };
    })
  );

  // Execute real MySQL interactive transaction when MySQL is reachable
  if (mysqlOk) {
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Ensure user record exists in MySQL for referential integrity
      await tx.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: true,
          role: user.role,
          phone: input.recipientPhone,
        },
      });

      const dbUser = await tx.user.findUniqueOrThrow({
        where: { email: user.email },
      });

      let subtotalInr = 0;
      const preparedItems: {
        inventoryItemId: string;
        catalogProductId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        sku: string;
        quantity: number;
        unitPriceInr: number;
        lineTotalInr: number;
        newStock: number;
      }[] = [];

      // Step 2: Verify relational InventoryItem stock inside the MySQL transaction
      for (const { product, quantity } of resolvedCatalogProducts) {
        const inv = await tx.inventoryItem.findUnique({
          where: { catalogProductId: product.id },
        });

        if (!inv) {
          throw new ResourceNotFoundError(
            `Inventory record for "${product.name}" (${product.sku}) was not found in MySQL.`
          );
        }

        if (inv.stockQuantity < quantity) {
          throw new InsufficientStockError(
            `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${inv.stockQuantity}. Transaction rolled back.`
          );
        }

        const unitPriceInr = inv.unitPriceInr;
        const lineTotalInr = Math.round(unitPriceInr * quantity);
        subtotalInr += lineTotalInr;

        const newStock = inv.stockQuantity - quantity;
        // Step 4: Decrement relational stock inside the transaction
        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: {
            stockQuantity: newStock,
            isAvailable: newStock > 0,
          },
        });

        preparedItems.push({
          inventoryItemId: inv.id,
          catalogProductId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images[0] ?? "",
          sku: product.sku,
          quantity,
          unitPriceInr,
          lineTotalInr,
          newStock,
        });
      }

      const taxInr = Math.round(subtotalInr * 0.18);
      const shippingInr = subtotalInr >= 2000 ? 0 : 149;
      const totalInr = subtotalInr + taxInr + shippingInr;
      const orderNumber = generateOrderNumber();

      // Step 3: Create the Order and OrderItems atomically
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: dbUser.id,
          status: "CONFIRMED",
          paymentStatus: "SIMULATED_PAID",
          paymentMethod: input.paymentMethod,
          subtotalInr,
          taxInr,
          shippingInr,
          totalInr,
          recipientName: input.recipientName,
          recipientEmail: input.recipientEmail,
          recipientPhone: input.recipientPhone,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingPincode: input.shippingPincode,
          notes: input.notes || null,
          items: {
            create: preparedItems.map((pi) => ({
              inventoryItemId: pi.inventoryItemId,
              catalogProductId: pi.catalogProductId,
              productName: pi.productName,
              productSlug: pi.productSlug,
              productImage: pi.productImage,
              sku: pi.sku,
              quantity: pi.quantity,
              unitPriceInr: pi.unitPriceInr,
              lineTotalInr: pi.lineTotalInr,
            })),
          },
        },
        include: {
          items: true,
          user: true,
        },
      });

      return order;
    });

    // Post-commit Step 5: Synchronize cached stockSnapshot in MongoDB catalog
    if (mongoOk) {
      await connectToMongoDB();
      for (const item of createdOrder.items) {
        const inv = await prisma.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
        });
        if (inv) {
          await ProductModel.findOneAndUpdate(
            { catalogId: item.catalogProductId },
            {
              stockSnapshot: inv.stockQuantity,
              isAvailable: inv.stockQuantity > 0,
            }
          ).catch(() => {});
        }
      }
    }

    const orderRecord: OrderRecord = {
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      userId: createdOrder.userId,
      userName: createdOrder.user.name,
      userEmail: createdOrder.user.email,
      status: createdOrder.status,
      paymentStatus: createdOrder.paymentStatus,
      paymentMethod: createdOrder.paymentMethod,
      subtotalInr: createdOrder.subtotalInr,
      taxInr: createdOrder.taxInr,
      shippingInr: createdOrder.shippingInr,
      totalInr: createdOrder.totalInr,
      recipientName: createdOrder.recipientName,
      recipientEmail: createdOrder.recipientEmail,
      recipientPhone: createdOrder.recipientPhone,
      shippingAddress: createdOrder.shippingAddress,
      shippingCity: createdOrder.shippingCity,
      shippingState: createdOrder.shippingState,
      shippingPincode: createdOrder.shippingPincode,
      notes: createdOrder.notes,
      createdAt: createdOrder.createdAt.toISOString(),
      updatedAt: createdOrder.updatedAt.toISOString(),
      transactionMode: "mysql-prisma-transaction",
      items: createdOrder.items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        inventoryItemId: i.inventoryItemId,
        catalogProductId: i.catalogProductId,
        productName: i.productName,
        productSlug: i.productSlug,
        productImage: i.productImage,
        sku: i.sku,
        quantity: i.quantity,
        unitPriceInr: i.unitPriceInr,
        lineTotalInr: i.lineTotalInr,
      })),
    };

    // Keep persistent fallback store in sync as well
    for (const item of orderRecord.items) {
      const pIdx = store.products.findIndex((p) => p.id === item.catalogProductId);
      if (pIdx >= 0) {
        store.products[pIdx].stockQuantity = Math.max(
          0,
          store.products[pIdx].stockQuantity - item.quantity
        );
        store.products[pIdx].isAvailable = store.products[pIdx].stockQuantity > 0;
      }
    }
    store.orders.unshift(orderRecord);
    writeFallbackStore(store);

    return orderRecord;
  }

  // Explicitly-labeled Local Development Atomic Fallback when MySQL is offline
  // First verify ALL items have enough stock before mutating any item (all-or-nothing)
  let subtotalInr = 0;
  for (const { product, quantity } of resolvedCatalogProducts) {
    const storeProd = store.products.find((p) => p.id === product.id);
    const availableStock = storeProd?.stockQuantity ?? product.stockQuantity;
    if (availableStock < quantity) {
      throw new InsufficientStockError(
        `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${availableStock}. Checkout aborted.`
      );
    }
    subtotalInr += Math.round(product.priceInr * quantity);
  }

  const orderId = `ord_${Date.now()}`;
  const orderNumber = generateOrderNumber();
  const taxInr = Math.round(subtotalInr * 0.18);
  const shippingInr = subtotalInr >= 2000 ? 0 : 149;
  const totalInr = subtotalInr + taxInr + shippingInr;
  const now = new Date().toISOString();

  const orderItems: OrderItemRecord[] = resolvedCatalogProducts.map(
    ({ product, quantity }, index) => {
      // Decrement stock in persistent store
      const pIdx = store.products.findIndex((p) => p.id === product.id);
      if (pIdx >= 0) {
        store.products[pIdx].stockQuantity -= quantity;
        store.products[pIdx].isAvailable = store.products[pIdx].stockQuantity > 0;
      }

      return {
        id: `oi_${Date.now()}_${index + 1}`,
        orderId,
        inventoryItemId: `inv_${product.id}`,
        catalogProductId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] ?? "",
        sku: product.sku,
        quantity,
        unitPriceInr: product.priceInr,
        lineTotalInr: Math.round(product.priceInr * quantity),
      };
    }
  );

  const fallbackOrder: OrderRecord = {
    id: orderId,
    orderNumber,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    status: "CONFIRMED",
    paymentStatus: "SIMULATED_PAID",
    paymentMethod: input.paymentMethod,
    subtotalInr,
    taxInr,
    shippingInr,
    totalInr,
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    recipientPhone: input.recipientPhone,
    shippingAddress: input.shippingAddress,
    shippingCity: input.shippingCity,
    shippingState: input.shippingState,
    shippingPincode: input.shippingPincode,
    notes: input.notes || null,
    createdAt: now,
    updatedAt: now,
    transactionMode: "dev-fallback-atomic",
    items: orderItems,
  };

  store.orders.unshift(fallbackOrder);
  writeFallbackStore(store);

  return fallbackOrder;
}

/**
 * Lists orders belonging ONLY to the authenticated user (Customer order history).
 */
export async function listOrdersForUser(user: AppUser): Promise<OrderRecord[]> {
  const mysqlOk = await isMySqlConnected();
  if (mysqlOk) {
    try {
      const dbOrders = await prisma.order.findMany({
        where: {
          OR: [{ userId: user.id }, { user: { email: user.email } }],
        },
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbOrders.length > 0) {
        return dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          userName: o.user.name,
          userEmail: o.user.email,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          subtotalInr: o.subtotalInr,
          taxInr: o.taxInr,
          shippingInr: o.shippingInr,
          totalInr: o.totalInr,
          recipientName: o.recipientName,
          recipientEmail: o.recipientEmail,
          recipientPhone: o.recipientPhone,
          shippingAddress: o.shippingAddress,
          shippingCity: o.shippingCity,
          shippingState: o.shippingState,
          shippingPincode: o.shippingPincode,
          notes: o.notes,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
          transactionMode: "mysql-prisma-transaction",
          items: o.items.map((i) => ({
            id: i.id,
            orderId: i.orderId,
            inventoryItemId: i.inventoryItemId,
            catalogProductId: i.catalogProductId,
            productName: i.productName,
            productSlug: i.productSlug,
            productImage: i.productImage,
            sku: i.sku,
            quantity: i.quantity,
            unitPriceInr: i.unitPriceInr,
            lineTotalInr: i.lineTotalInr,
          })),
        }));
      }
    } catch {
      // Fallback below
    }
  }

  const store = readFallbackStore();
  return store.orders.filter(
    (o) =>
      o.userId === user.id ||
      o.userEmail?.toLowerCase() === user.email.toLowerCase()
  );
}

/**
 * Lists ALL orders across the platform (for Admin dashboard).
 */
export async function listAllOrders(): Promise<OrderRecord[]> {
  const mysqlOk = await isMySqlConnected();
  if (mysqlOk) {
    try {
      const dbOrders = await prisma.order.findMany({
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
      if (dbOrders.length > 0) {
        return dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          userName: o.user.name,
          userEmail: o.user.email,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          subtotalInr: o.subtotalInr,
          taxInr: o.taxInr,
          shippingInr: o.shippingInr,
          totalInr: o.totalInr,
          recipientName: o.recipientName,
          recipientEmail: o.recipientEmail,
          recipientPhone: o.recipientPhone,
          shippingAddress: o.shippingAddress,
          shippingCity: o.shippingCity,
          shippingState: o.shippingState,
          shippingPincode: o.shippingPincode,
          notes: o.notes,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
          transactionMode: "mysql-prisma-transaction",
          items: o.items.map((i) => ({
            id: i.id,
            orderId: i.orderId,
            inventoryItemId: i.inventoryItemId,
            catalogProductId: i.catalogProductId,
            productName: i.productName,
            productSlug: i.productSlug,
            productImage: i.productImage,
            sku: i.sku,
            quantity: i.quantity,
            unitPriceInr: i.unitPriceInr,
            lineTotalInr: i.lineTotalInr,
          })),
        }));
      }
    } catch {
      // Fallback below
    }
  }

  const store = readFallbackStore();
  return store.orders;
}

/**
 * Experiment 8: Retrieves a single order by ID or orderNumber and strictly enforces
 * ownership so a Customer CANNOT view another customer's order by modifying the URL.
 */
export async function getOrderByIdForUser(
  orderIdentifier: string,
  user: AppUser
): Promise<OrderRecord | null> {
  const allOrders = await listAllOrders();
  const found = allOrders.find(
    (o) =>
      o.id === orderIdentifier ||
      o.orderNumber.toLowerCase() === orderIdentifier.toLowerCase()
  );

  if (!found) {
    return null;
  }

  const isOwner =
    found.userId === user.id ||
    found.userEmail?.toLowerCase() === user.email.toLowerCase();

  if (user.role !== "ADMIN" && !isOwner) {
    throw new ForbiddenOrderAccessError(
      "Access Denied: You are not authorized to view another customer's order."
    );
  }

  return found;
}

/**
 * Updates an order's operational status (Admin only).
 */
export async function updateOrderStatus(
  orderIdentifier: string,
  status: OrderStatus
): Promise<OrderRecord> {
  const mysqlOk = await isMySqlConnected();
  const store = readFallbackStore();

  if (mysqlOk) {
    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdentifier }, { orderNumber: orderIdentifier }],
      },
    });
    if (existing) {
      await prisma.order.update({
        where: { id: existing.id },
        data: { status },
      });
    }
  }

  const idx = store.orders.findIndex(
    (o) =>
      o.id === orderIdentifier ||
      o.orderNumber.toLowerCase() === orderIdentifier.toLowerCase()
  );

  if (idx < 0) {
    throw new ResourceNotFoundError(`Order "${orderIdentifier}" not found.`);
  }

  store.orders[idx] = {
    ...store.orders[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeFallbackStore(store);

  return store.orders[idx];
}

/**
 * Computes real-time operational analytics for the Admin Dashboard.
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [products, categories, orders] = await Promise.all([
    listProducts(),
    listCategories(),
    listAllOrders(),
  ]);

  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenueInr = activeOrders.reduce((sum, o) => sum + o.totalInr, 0);
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.reorderThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const categoryBreakdown = categories.map((cat) => {
    const catProducts = products.filter(
      (p) => p.categoryId === cat.id || p.categorySlug === cat.slug
    );
    return {
      categoryName: cat.name,
      productCount: catProducts.length,
      totalStock: catProducts.reduce((sum, p) => sum + p.stockQuantity, 0),
    };
  });

  return {
    totalRevenueInr,
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount,
    outOfStockCount,
    totalCategories: categories.length,
    recentOrders: orders.slice(0, 6),
    categoryBreakdown,
  };
}
