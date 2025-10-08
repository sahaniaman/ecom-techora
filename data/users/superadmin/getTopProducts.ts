// @/data/users/superadmin/getTopProducts.ts
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Products";

export interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
  progress: number;
  price: number;
  stock: number;
}

export default async function getTopProducts(): Promise<TopProduct[]> {
  try {
    console.log("🔍 getTopProducts called");
    
    const requestUser = await getCurrentUser();
    
    if (!requestUser) {
      throw new Error("Authentication required: No user found in session");
    }
    
    if (requestUser.role !== "SUPER_ADMIN") {
      throw new Error(`Authorization failed: User role is ${requestUser.role}, but SUPER_ADMIN required`);
    }

    await dbConnect();

    // Get products sorted by stock (as a proxy for popularity since we don't have order data yet)
    const products = await Product.find({ isActive: true })
      .sort({ stock: -1 })
      .limit(4)
      .select('name price stock')
      .lean();

    if (products.length === 0) {
      // Return empty array if no products
      return [];
    }

    // Find max stock for calculating progress
    const maxStock = Math.max(...products.map(p => p.stock || 0));

    // Transform to TopProduct format
    const topProducts: TopProduct[] = products.map((product) => {
      const stock = product.stock || 0;
      const price = product.basePrice || 0;
      // Simulate sales based on stock availability
      const sales = Math.floor(stock * 0.6); // Assume 60% of stock represents sales potential
      const revenue = sales * price;
      const progress = maxStock > 0 ? Math.floor((stock / maxStock) * 100) : 0;

      return {
        name: product.name,
        sales,
        revenue: `$${revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        progress,
        price,
        stock,
      };
    });

    console.log("✅ Top products fetched successfully");

    return topProducts;

  } catch (error) {
    console.error("❌ Error in getTopProducts:", error);
    throw error;
  }
}
