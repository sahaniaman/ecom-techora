"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

interface UseCartReturn {
  cartItems: CartItem[];
  totalItems: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useCart = (): UseCartReturn => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    if (!isSignedIn) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/cart");
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Add to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart || []);
      } else {
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, router]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setError(null);

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from cart");
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart || []);
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError(err instanceof Error ? err.message : "Failed to remove from cart");
    }
  }, []);

  // Update quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      setError(null);

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart || []);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err instanceof Error ? err.message : "Failed to clear cart");
    }
  }, []);

  // Calculate total items count
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cartItems,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
    error,
  };
};