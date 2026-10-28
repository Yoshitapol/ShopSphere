// ============================================================================
// ShopSphere Application TypeScript Interfaces & Types
// Experiment 1: Next.js App Router Fundamentals & Type Safety
// ============================================================================

export type UserRole = "GUEST" | "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "SIMULATED_PAID" | "PENDING" | "FAILED";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  phone?: string | null;
  authSource: "better-auth" | "dev-persona";
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductCatalogItem {
  id: string; // Stable catalogProductId (shared between MongoDB catalogId and MySQL InventoryItem.catalogProductId)
  mongoId?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  priceInr: number;
  originalPriceInr?: number;
  images: string[];
  categorySlug: string;
  categoryName: string;
  categoryId: string;
  tags: string[];
  specifications: ProductSpecification[];
  stockQuantity: number;
  reorderThreshold: number;
  isAvailable: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  brand: string;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  catalogProductId: string;
  name: string;
  slug: string;
  sku: string;
  priceInr: number;
  image: string;
  categoryName: string;
  quantity: number;
  maxStock: number;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  inventoryItemId: string;
  catalogProductId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotalInr: number;
  taxInr: number;
  shippingInr: number;
  totalInr: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
  transactionMode?: "mysql-prisma-transaction" | "dev-fallback-atomic";
}

export interface DatabaseHealthStatus {
  mysqlConnected: boolean;
  mongoConnected: boolean;
  mode: "hybrid-live" | "partial-live" | "dev-fallback";
  mysqlMessage: string;
  mongoMessage: string;
  oauthConfigured: {
    google: boolean;
    github: boolean;
  };
}

export interface DashboardAnalytics {
  totalRevenueInr: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  recentOrders: OrderRecord[];
  categoryBreakdown: {
    categoryName: string;
    productCount: number;
    totalStock: number;
  }[];
}
