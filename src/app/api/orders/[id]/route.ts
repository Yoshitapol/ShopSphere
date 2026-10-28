// ============================================================================
// ShopSphere Single Order API Route Handler (/api/orders/[id])
// Experiment 8: Strict Ownership Verification (Prevents IDOR / URL Tampering)
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, verifyApiAdmin } from "@/lib/permissions/rbac";
import {
  ForbiddenOrderAccessError,
  getOrderByIdForUser,
  updateOrderStatus,
} from "@/lib/prisma/order-service";
import { ResourceNotFoundError } from "@/lib/mongodb/product-service";
import { orderStatusUpdateSchema } from "@/lib/validation/schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view order details.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const order = await getOrderByIdForUser(id, user);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Order "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ForbiddenOrderAccessError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch order.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
    let body: { status?: string };
    try {
      body = (await request.json()) as { status?: string };
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body.",
        },
        { status: 400 }
      );
    }

    const parsed = orderStatusUpdateSchema.safeParse({
      orderId: id,
      status: body.status,
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status value.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(
      parsed.data.orderId,
      parsed.data.status
    );

    revalidatePath("/orders");
    revalidatePath(`/orders/${updated.id}`);
    revalidatePath("/dashboard/orders");

    return NextResponse.json(
      {
        success: true,
        message: `Order ${updated.orderNumber} status updated to ${updated.status}.`,
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
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to update order status.",
      },
      { status: 500 }
    );
  }
}
