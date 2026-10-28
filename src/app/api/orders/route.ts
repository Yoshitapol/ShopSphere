// ============================================================================
// ShopSphere Orders API Route Handler (/api/orders)
// Experiment 4: Route Handlers (GET & POST)
// Experiment 5: Transactional Checkout via Prisma / MySQL
// Experiment 8: Role-Scoped Order Listing (Customers see own, Admins see all)
// ============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/permissions/rbac";
import {
  executeTransactionalCheckout,
  InsufficientStockError,
  listAllOrders,
  listOrdersForUser,
} from "@/lib/prisma/order-service";
import { ResourceNotFoundError } from "@/lib/mongodb/product-service";
import { checkoutInputSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view orders.",
        },
        { status: 401 }
      );
    }

    const orders =
      user.role === "ADMIN"
        ? await listAllOrders()
        : await listOrdersForUser(user);

    return NextResponse.json(
      {
        success: true,
        role: user.role,
        count: orders.length,
        data: orders,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to list orders.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to place an order.",
        },
        { status: 401 }
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

    const parsed = checkoutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Checkout input validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const order = await executeTransactionalCheckout(user, parsed.data);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/orders");
    revalidatePath("/dashboard/orders");

    return NextResponse.json(
      {
        success: true,
        message: `Order ${order.orderNumber} created successfully.`,
        data: order,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof InsufficientStockError) {
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
        error: err instanceof Error ? err.message : "Failed to place order.",
      },
      { status: 500 }
    );
  }
}
