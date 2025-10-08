// @/data/users/superadmin/getDashboardStats.ts
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Products";

export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalProducts: number;
  newProductsThisWeek: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
}

export default async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log("🔍 getDashboardStats called");
    
    const requestUser = await getCurrentUser();
    
    if (!requestUser) {
      throw new Error("Authentication required: No user found in session");
    }
    
    if (requestUser.role !== "SUPER_ADMIN") {
      throw new Error(`Authorization failed: User role is ${requestUser.role}, but SUPER_ADMIN required`);
    }

    await dbConnect();

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalUsers,
      newUsersThisMonth,
      totalProducts,
      newProductsThisWeek,
      activeUsers,
      suspendedUsers,
      pendingUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({}),
      Product.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ status: "SUSPENDED" }),
      User.countDocuments({ status: "PENDING_VERIFICATION" }),
    ]);

    console.log("✅ Dashboard stats fetched successfully");

    return {
      totalUsers,
      newUsersThisMonth,
      totalProducts,
      newProductsThisWeek,
      activeUsers,
      suspendedUsers,
      pendingUsers,
    };

  } catch (error) {
    console.error("❌ Error in getDashboardStats:", error);
    throw error;
  }
}
