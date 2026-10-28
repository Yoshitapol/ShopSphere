// ============================================================================
// ShopSphere Single Product API Route Handler (/api/products/[id])
// Experiment 1: Async Dynamic Route Params Convention
// Experiment 4: Route Handlers (GET, PUT, PATCH, DELETE), Zod Validation
// Experiment 8: Server-Boundary Admin Role Verification on Mutations
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteProduct,
  DuplicateResourceError,
  getProductByIdOrSlug,
  ResourceNotFoundError,
  updateProduct,
} from "@/lib/mongodb/product-service";
import { productUpdateSchema } from "@/lib/validation/schemas";
import { verifyApiAdmin } from "@/lib/permissions/rbac";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await getProductByIdOrSlug(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to retrieve product.",
      },
      { status: 500 }
    );
  }
}

async function handleUpdate(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;

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

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Product update validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, parsed.data);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${updated.id}`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/dashboard/products");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully.",
        data: updated,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 404 }
      );
    }
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
          err instanceof Error ? err.message : "Failed to update product.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleUpdate(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleUpdate(request, context);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const deleted = await deleteProduct(id);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/products");

    return NextResponse.json(
      {
        success: true,
        message: `Product "${deleted.name}" deleted successfully.`,
        data: deleted,
      },
      { status: 200 }
    );
  } catch (err) {
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
          err instanceof Error ? err.message : "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}
