import type { Product } from "@/types/product";

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export async function getProducts(): Promise<{
  products: Product[];
  error?: string;
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Next.js में server components के लिए cache behavior
      cache: 'no-store', // Real-time data के लिए
      // या फिर
      // next: { revalidate: 60 } // 60 seconds के लिए cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();

    if (data.success) {
      return {
        products: data.data || [],
      };
    } else {
      throw new Error(data.message || "Failed to fetch products from API");
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    return {
      products: [],
      error: err instanceof Error ? err.message : "An unknown error occurred",
    };
  }
}