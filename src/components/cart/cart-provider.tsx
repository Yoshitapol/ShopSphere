"use client";

// ============================================================================
// ShopSphere Shopping Cart Context Provider
// Experiment 1 & 2: Client Component State Management & Cart Persistence
// Stores ONLY non-sensitive product references in localStorage (never tokens/secrets).
// ============================================================================
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

const CART_STORAGE_KEY = "shopsphere_cart_v1";

interface CartContextValue {
  items: CartItem[];
  isHydrated: boolean;
  totalItems: number;
  subtotalInr: number;
  taxInr: number;
  shippingInr: number;
  grandTotalInr: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (catalogProductId: string) => void;
  updateQuantity: (catalogProductId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore malformed storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.catalogProductId === newItem.catalogProductId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          const current = updated[existingIndex];
          const nextQty = Math.min(
            current.maxStock,
            Math.max(1, current.quantity + quantity)
          );
          updated[existingIndex] = {
            ...current,
            priceInr: newItem.priceInr,
            maxStock: newItem.maxStock,
            quantity: nextQty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            ...newItem,
            quantity: Math.min(newItem.maxStock, Math.max(1, quantity)),
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((catalogProductId: string) => {
    setItems((prev) =>
      prev.filter((i) => i.catalogProductId !== catalogProductId)
    );
  }, []);

  const updateQuantity = useCallback(
    (catalogProductId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => i.catalogProductId !== catalogProductId)
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.catalogProductId !== catalogProductId) return item;
          return {
            ...item,
            quantity: Math.min(item.maxStock, Math.max(1, quantity)),
          };
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalInr = items.reduce(
      (sum, i) => sum + Math.round(i.priceInr * i.quantity),
      0
    );
    const taxInr = Math.round(subtotalInr * 0.18);
    const shippingInr = subtotalInr === 0 ? 0 : subtotalInr >= 2000 ? 0 : 149;
    const grandTotalInr = subtotalInr + taxInr + shippingInr;
    return {
      totalItems,
      subtotalInr,
      taxInr,
      shippingInr,
      grandTotalInr,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        ...totals,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
