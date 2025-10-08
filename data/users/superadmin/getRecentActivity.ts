// @/data/users/superadmin/getRecentActivity.ts
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Products";

export interface Activity {
  action: string;
  user: string;
  time: string;
  amount: string;
  status: string;
  timestamp: Date;
}

export default async function getRecentActivity(): Promise<Activity[]> {
  try {
    console.log("🔍 getRecentActivity called");
    
    const requestUser = await getCurrentUser();
    
    if (!requestUser) {
      throw new Error("Authentication required: No user found in session");
    }
    
    if (requestUser.role !== "SUPER_ADMIN") {
      throw new Error(`Authorization failed: User role is ${requestUser.role}, but SUPER_ADMIN required`);
    }

    await dbConnect();

    const activities: Activity[] = [];

    // Get recent users (last 10)
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('profile.firstName profile.lastName createdAt')
      .lean();

    // Get recent products (last 5)
    const recentProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt')
      .lean();

    // Add user activities
    for (const user of recentUsers) {
      const fullName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown User';
      const timeAgo = getTimeAgo(user.createdAt);
      
      activities.push({
        action: "New user",
        user: fullName,
        time: timeAgo,
        amount: "-",
        status: "active",
        timestamp: user.createdAt,
      });
    }

    // Add product activities
    for (const product of recentProducts) {
      const timeAgo = getTimeAgo(product.createdAt);
      
      activities.push({
        action: "Product added",
        user: "Admin",
        time: timeAgo,
        amount: "-",
        status: "pending",
        timestamp: product.createdAt,
      });
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Return top 5
    return activities.slice(0, 5);

  } catch (error) {
    console.error("❌ Error in getRecentActivity:", error);
    throw error;
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  return `${Math.floor(seconds / 2592000)} month${Math.floor(seconds / 2592000) > 1 ? 's' : ''} ago`;
}
