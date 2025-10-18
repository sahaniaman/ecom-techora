/** biome-ignore-all lint/correctness/useExhaustiveDependencies: explanation */
"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types/product";


interface UseProductsOptions {
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
    const { autoFetch = true } = options;
    
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await fetch("/api/products/")
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            
            if (data.success) {
                setProducts(data.data || [])
            } else {
                throw new Error(data.message || "Failed to fetch products from API")
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
            setError(errorMessage)
            console.error("Error fetching products:", err)
            setProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchProducts()
        }
    }, [autoFetch])

    const refetch = async () => {
        await fetchProducts()
    }

    const clearError = () => {
        setError(null)
    }

    console.log("Products::::::::::hook::::::::", products)
    return {
        products,
        isLoading,
        error,
        refetch,
        clearError
    }
}