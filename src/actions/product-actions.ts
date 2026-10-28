"use server";

// ============================================================================
// ShopSphere Product & Category Server Actions
// Experiment 4: React Server Actions, Zod Validation & Next.js Cache Invalidation
// Experiment 8: Server-Boundary Admin Role Verification
// ============================================================================
import { revalidatePath } from "next/cache";
import { verifyApiAdmin } from "@/lib/permissions/rbac";
import {
  createCategory,
  createProduct,
  deleteProduct,
  DuplicateResourceError,
  ResourceNotFoundError,
  updateProduct,
} from "@/lib/mongodb/product-service";
import { resetFallbackStore } from "@/lib/fallback-store";
import {
  categoryInputSchema,
  productInputSchema,
  type CategoryInput,
  type ProductInput,
} from "@/lib/validation/schemas";
import type { CategoryRecord, ProductCatalogItem } from "@/types";

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}

export async function createProductServerAction(
  rawInput: ProductInput
): Promise<ActionResult<ProductCatalogItem>> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  const parsed = productInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed. Please check the highlighted form fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await createProduct(parsed.data);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return {
      ok: true,
      message: `Product "${product.name}" (${product.sku}) created successfully.`,
      data: product,
    };
  } catch (err) {
    if (err instanceof DuplicateResourceError) {
      return {
        ok: false,
        message: err.message,
      };
    }
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating the product.",
    };
  }
}

export async function updateProductServerAction(
  productIdOrSlug: string,
  rawInput: ProductInput
): Promise<ActionResult<ProductCatalogItem>> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  const parsed = productInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed. Please review the form fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const updated = await updateProduct(productIdOrSlug, parsed.data);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${updated.id}`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return {
      ok: true,
      message: `Product "${updated.name}" updated successfully.`,
      data: updated,
    };
  } catch (err) {
    if (
      err instanceof DuplicateResourceError ||
      err instanceof ResourceNotFoundError
    ) {
      return {
        ok: false,
        message: err.message,
      };
    }
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while updating the product.",
    };
  }
}

export async function deleteProductServerAction(
  productIdOrSlug: string
): Promise<ActionResult<{ deletedId: string; name: string }>> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  try {
    const result = await deleteProduct(productIdOrSlug);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return {
      ok: true,
      message: `Product "${result.name}" deleted from catalog.`,
      data: result,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to delete product.",
    };
  }
}

export async function createCategoryServerAction(
  rawInput: CategoryInput
): Promise<ActionResult<CategoryRecord>> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  const parsed = categoryInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid category details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const category = await createCategory(parsed.data);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");

    return {
      ok: true,
      message: `Category "${category.name}" created successfully.`,
      data: category,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to create category.",
    };
  }
}

export async function resetDemoCatalogAction(): Promise<ActionResult> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  resetFallbackStore();
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Demo catalog, inventory quantities, and sample orders reset to initial seed state.",
  };
}
