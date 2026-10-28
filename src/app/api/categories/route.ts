// ============================================================================
// ShopSphere Categories API Route Handler (/api/categories)
// Experiment 4: Route Handlers (GET & POST), Zod Validation
// Experiment 5: MySQL Category Management
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createCategory,
  DuplicateResourceError,
  listCategories,
} from "@/lib/mongodb/product-service";
import { categoryInputSchema } from "@/lib/validation/schemas";
import { verifyApiAdmin } from "@/lib/permissions/rbac";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        data: categories,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to list categories.",
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

    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Category validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = await createCategory(parsed.data);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/products");

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
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
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to create category.",
      },
      { status: 500 }
    );
  }
}
