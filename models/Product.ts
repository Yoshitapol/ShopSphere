// ============================================================================
// ShopSphere MongoDB Product Catalog Model (Mongoose ODM)
// Experiment 6: MongoDB and Mongoose Schema Validation, Embedded Subdocuments & Indexes
// ============================================================================
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISpecification {
  label: string;
  value: string;
}

export interface IProductDocument extends Document {
  catalogId: string; // Stable cross-DB identifier referenced by MySQL InventoryItem.catalogProductId & OrderItem.catalogProductId
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  priceInr: number;
  originalPriceInr?: number;
  images: string[];
  categorySlug: string;
  categoryName: string;
  categoryId: string;
  tags: string[];
  specifications: ISpecification[];
  brand: string;
  warranty: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  // Snapshot of relational stock owned by MySQL InventoryItem for fast catalog filtering
  stockSnapshot: number;
  reorderThreshold: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Embedded subdocument schema for flexible product specifications
const SpecificationSchema = new Schema<ISpecification>(
  {
    label: {
      type: String,
      required: [true, "Specification label is required"],
      trim: true,
      maxlength: [80, "Specification label cannot exceed 80 characters"],
    },
    value: {
      type: String,
      required: [true, "Specification value is required"],
      trim: true,
      maxlength: [200, "Specification value cannot exceed 200 characters"],
    },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    catalogId: {
      type: String,
      required: [true, "Stable catalogId is required for cross-DB linking"],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [160, "Product name cannot exceed 160 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [260, "Short description cannot exceed 260 characters"],
    },
    description: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
      minlength: [10, "Detailed description must be at least 10 characters"],
    },
    priceInr: {
      type: Number,
      required: [true, "Product price in INR is required"],
      min: [1, "Price must be at least ₹1"],
      index: true,
    },
    originalPriceInr: {
      type: Number,
      min: [1, "Original price must be positive"],
    },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: "At least one product image URL is required",
      },
      default: ["https://placehold.co/800x600/eef2ff/4f46e5?text=ShopSphere+Product"],
    },
    categorySlug: {
      type: String,
      required: [true, "Category slug is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    categoryId: {
      type: String,
      required: [true, "Relational categoryId reference is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    specifications: {
      type: [SpecificationSchema],
      default: [],
    },
    brand: {
      type: String,
      default: "ShopSphere Originals",
      trim: true,
    },
    warranty: {
      type: String,
      default: "1 Year Manufacturer Warranty",
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1.0"],
      max: [5, "Rating cannot exceed 5.0"],
    },
    reviewCount: {
      type: Number,
      default: 12,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    stockSnapshot: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    reorderThreshold: {
      type: Number,
      default: 5,
      min: [0, "Reorder threshold cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Compound and text indexes for fast catalog search and category filtering
ProductSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });
ProductSchema.index({ categorySlug: 1, priceInr: 1 });
ProductSchema.index({ featured: -1, createdAt: -1 });

export const ProductModel: Model<IProductDocument> =
  (mongoose.models.Product as Model<IProductDocument>) ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;
