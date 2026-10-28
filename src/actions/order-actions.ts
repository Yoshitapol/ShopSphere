"use server";

// ============================================================================
// ShopSphere Order & Transactional Checkout Server Actions
// Experiment 4: Server Actions & Zod Validation
// Experiment 5: ACID Checkout Transaction Execution
// Experiment 8: Authenticated Customer & Admin Authorization Checks
// ============================================================================
import { revalidatePath } from "next/cache";
import { getCurrentUser, verifyApiAdmin } from "@/lib/permissions/rbac";
import {
  executeTransactionalCheckout,
  InsufficientStockError,
  updateOrderStatus,
} from "@/lib/prisma/order-service";
import { ResourceNotFoundError } from "@/lib/mongodb/product-service";
import {
  checkoutInputSchema,
  orderStatusUpdateSchema,
  type CheckoutInput,
} from "@/lib/validation/schemas";
import type { OrderRecord, OrderStatus } from "@/types";
import type { ActionResult } from "@/actions/product-actions";

export async function placeOrderServerAction(
  rawInput: CheckoutInput
): Promise<ActionResult<OrderRecord>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      message: "You must be signed in as a Customer or Admin to place an order.",
    };
  }

  const parsed = checkoutInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your shipping details and cart items.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const order = await executeTransactionalCheckout(user, parsed.data);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/products");

    return {
      ok: true,
      message: `Order ${order.orderNumber} placed successfully!`,
      data: order,
    };
  } catch (err) {
    if (
      err instanceof InsufficientStockError ||
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
          : "Checkout transaction failed. Please try again.",
    };
  }
}

export async function updateOrderStatusServerAction(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult<OrderRecord>> {
  const authCheck = await verifyApiAdmin();
  if (!authCheck.authorized) {
    return {
      ok: false,
      message: authCheck.error,
    };
  }

  const parsed = orderStatusUpdateSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid order status update request.",
    };
  }

  try {
    const updated = await updateOrderStatus(
      parsed.data.orderId,
      parsed.data.status
    );
    revalidatePath("/orders");
    revalidatePath(`/orders/${updated.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");

    return {
      ok: true,
      message: `Order ${updated.orderNumber} status updated to ${updated.status}.`,
      data: updated,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}
