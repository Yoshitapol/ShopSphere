// ============================================================================
// ShopSphere Formatting & UI Utility Helpers
// ============================================================================

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  return inrFormatter.format(Math.round(amount));
}

export function formatDate(isoOrDate: string | Date): string {
  try {
    const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return String(isoOrDate);
  }
}

export function formatDateTime(isoOrDate: string | Date): string {
  try {
    const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return String(isoOrDate);
  }
}

export function calculateDiscountPercent(
  priceInr: number,
  originalPriceInr?: number
): number {
  if (!originalPriceInr || originalPriceInr <= priceInr) return 0;
  return Math.round(((originalPriceInr - priceInr) / originalPriceInr) * 100);
}
