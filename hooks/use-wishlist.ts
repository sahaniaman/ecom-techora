"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type{ Product } from "@/types/product";
import { IProduct } from "@/models/Products";

interface UseWishlistReturn {
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useWishlist = (): UseWishlistReturn => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/users/wishlist");
      
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.wishlist.map((item: any) => item._id || item));
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (product: IProduct) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const productId = product._id as string ;
      const isCurrentlyInWishlist = isInWishlist(productId);
      const action = isCurrentlyInWishlist ? "remove" : "add";

      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist.map((item: any) => item._id || item));
      } else {
        throw new Error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      setError(err instanceof Error ? err.message : "Failed to update wishlist");
      
      // Revert optimistic update
      await fetchWishlist();
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, isInWishlist, router, fetchWishlist]);

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isSignedIn, fetchWishlist]);

  return {
    wishlist,
    isInWishlist,
    toggleWishlist,
    isLoading,
    error,
  };
};