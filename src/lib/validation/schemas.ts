// ============================================================================
// ShopSphere Zod Validation Schemas & Input Sanitization
// Experiment 4: Route Handlers, Server Actions & Zod Input Validation
// ============================================================================
import { z } from "zod";

/**
 * Strips script tags and trims whitespace to prevent stored XSS payloads.
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const specificationItemSchema = z.object({
  label: z
    .string()
    .min(1, "Specification label is required")
    .max(80, "Label cannot exceed 80 characters")
    .transform(sanitizeText),
  value: z
    .string()
    .min(1, "Specification value is required")
    .max(200, "Value cannot exceed 200 characters")
    .transform(sanitizeText),
});

export const productInputSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(160, "Product name cannot exceed 160 characters")
    .transform(sanitizeText),
  slug: z
    .string()
    .min(3, "Product slug must be at least 3 characters")
    .max(180, "Slug cannot exceed 180 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(40, "SKU cannot exceed 40 characters")
    .transform((v) => sanitizeText(v).toUpperCase()),
  shortDescription: z
    .string()
    .min(10, "Short summary must be at least 10 characters")
    .max(260, "Short summary cannot exceed 260 characters")
    .transform(sanitizeText),
  description: z
    .string()
    .min(20, "Detailed description must be at least 20 characters")
    .max(4000, "Description cannot exceed 4000 characters")
    .transform(sanitizeText),
  priceInr: z.coerce
    .number({ invalid_type_error: "Price must be a valid number in INR" })
    .min(1, "Price must be at least ₹1")
    .max(2500000, "Price cannot exceed ₹25,00,000"),
  originalPriceInr: z.coerce
    .number()
    .min(1, "Original MRP must be at least ₹1")
    .optional()
    .nullable(),
  images: z
    .array(z.string().url("Each image must be a valid https:// URL"))
    .min(1, "At least one product image URL is required"),
  categoryId: z.string().min(2, "Please select a valid category"),
  tags: z.array(z.string().transform(sanitizeText)).default([]),
  specifications: z.array(specificationItemSchema).default([]),
  stockQuantity: z.coerce
    .number({ invalid_type_error: "Stock quantity must be an integer" })
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .max(100000, "Stock quantity exceeds warehouse limit"),
  reorderThreshold: z.coerce
    .number()
    .int()
    .min(0, "Reorder threshold cannot be negative")
    .default(5),
  brand: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(80)
    .default("ShopSphere Originals")
    .transform(sanitizeText),
  warranty: z
    .string()
    .min(2)
    .max(120)
    .default("1 Year Manufacturer Warranty")
    .transform(sanitizeText),
  featured: z.coerce.boolean().default(false),
});

export const productUpdateSchema = productInputSchema.partial();

export const categoryInputSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name cannot exceed 80 characters")
    .transform(sanitizeText),
  slug: z
    .string()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description cannot exceed 300 characters")
    .transform(sanitizeText),
  iconName: z.string().default("Package"),
  isActive: z.coerce.boolean().default(true),
});

export const checkoutItemSchema = z.object({
  catalogProductId: z.string().min(2, "Invalid product identifier"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(25, "Maximum 25 units per order line"),
});

export const checkoutInputSchema = z.object({
  recipientName: z
    .string()
    .min(3, "Recipient full name must be at least 3 characters")
    .max(100)
    .transform(sanitizeText),
  recipientEmail: z
    .string()
    .email("Please enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
  recipientPhone: z
    .string()
    .min(10, "Enter a valid 10-digit Indian mobile number")
    .max(16)
    .regex(/^[+0-9\s-]{10,16}$/, "Phone number format is invalid")
    .transform(sanitizeText),
  shippingAddress: z
    .string()
    .min(8, "Please provide complete street/flat address")
    .max(250)
    .transform(sanitizeText),
  shippingCity: z
    .string()
    .min(2, "City is required")
    .max(80)
    .transform(sanitizeText),
  shippingState: z
    .string()
    .min(2, "State is required")
    .max(80)
    .transform(sanitizeText),
  shippingPincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code"),
  paymentMethod: z
    .enum(["SIMULATED_UPI", "SIMULATED_CARD", "SIMULATED_NETBANKING", "SIMULATED_COD"])
    .default("SIMULATED_UPI"),
  notes: z
    .string()
    .max(300, "Delivery notes cannot exceed 300 characters")
    .optional()
    .transform((v) => (v ? sanitizeText(v) : "")),
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your cart is empty. Add at least one item before checkout."),
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(2, "Order ID is required"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
