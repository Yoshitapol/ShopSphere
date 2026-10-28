// ============================================================================
// ShopSphere Products Collection API Route Handler (/api/products)
// Experiment 4: Route Handlers (GET & POST), Zod Validation, HTTP Status Codes
// Experiment 8: Server-Boundary Admin Role Verification on Mutations
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createProduct,
  DuplicateResourceError,
  getDatabaseHealthStatus,
  listProducts,
  ResourceNotFoundError,
  type ProductFilterOptions,
} from "@/lib/mongodb/product-service";
import { productInputSchema } from "@/lib/validation/schemas";
import { verifyApiAdmin } from "@/lib/permissions/rbac";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const sortRaw = searchParams.get("sort") as ProductFilterOptions["sort"] | null;
    const featuredOnly = searchParams.get("featured") === "true";
    const inStockOnly = searchParams.get("inStock") === "true";

    const filters: ProductFilterOptions = {
      search,
      category,
      minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      sort: sortRaw ?? "featured",
      featuredOnly,
      inStockOnly,
    };

    const [products, health] = await Promise.all([
      listProducts(filters),
      getDatabaseHealthStatus(),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        storageMode: health.mode,
        data: products,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to retrieve product catalog.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyApiAdmin();
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error,
        },
        { status: authCheck.status }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const parsed = productInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Product validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = await createProduct(parsed.data);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/products");

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: created,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DuplicateResourceError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 409 }
      );
    }
    if (err instanceof ResourceNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to create product.",
      },
      { status: 500 }
    );
  }
}
