// @/data/users/superadmin/getAllUsers.ts - Without orderHistory population
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";


export default async function getAllUsers() {
    try {
        console.log("🔍 getAllUsers called - Direct DB version");
        
        const RequestUser = await getCurrentUser();
        console.log("🔍 Current User:", RequestUser);
        
        if (!RequestUser) {
            console.log("❌ No user found");
            return [];
        }
        
        if (RequestUser.role !== "SUPER_ADMIN") {
            console.log("❌ User is not SUPER_ADMIN, role:", RequestUser.role);
            return [];
        }

        console.log("🔍 Connecting to database...");
        await dbConnect();

        // Sirf wishlist populate karein, orderHistory nahi
        const users = await User.find({})
            .select('-__v -paymentMethods -cart')
            .populate('wishlist', 'name price images') // Product model ab exist karta hai
            .lean();

        console.log("✅ Users found:", users.length);

        // Transform to safe format
        const safeUsers = users.map(user => ({
            id: user._id?.toString(),
            clerkId: user.clerkId,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            profile: user.profile || {},
            addresses: user.addresses || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
            lastActiveAt: user.lastActiveAt,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
        }));

        return safeUsers;

    } catch (error) {
        console.error("❌ Error in getAllUsers:", error);
        throw new Error("Failed to fetch users from database");
    }
}