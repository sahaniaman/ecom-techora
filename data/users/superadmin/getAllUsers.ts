// @/data/users/superadmin/getAllUsers.ts - Without orderHistory population
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";


export default async function getAllUsers() {
    try {
        // console.log("🔍 getAllUsers called - Direct DB version");
        
        const RequestUser = await getCurrentUser();
        // console.log("🔍 Current User:", RequestUser);
        
        if (!RequestUser) {
            // console.log("❌ No user found");
            throw new Error("Authentication required: No user found in session");
        }
        
        if (RequestUser.role !== "SUPER_ADMIN") {
            // console.log("❌ User is not SUPER_ADMIN, role:", RequestUser.role);
            throw new Error(`Authorization failed: User role is ${RequestUser.role}, but SUPER_ADMIN required`);
        }

        // console.log("🔍 Connecting to database...");
        await dbConnect();

        // Sirf essential fields fetch karein
        const users = await User.find({})
            .select('_id clerkId email phone role profile.firstName profile.lastName')
            .lean();

        // console.log("✅ Users found:", users.length);

        // Transform to safe format - sirf essential data
        const safeUsers = users.map(user => ({
            id: user._id?.toString() || '',
            clerkId: user.clerkId || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'USER',
            profile: {
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                avatar: user.profile?.avatar || '',
            }
        }));

        return safeUsers;

    } catch (error) {
        console.error("❌ Error in getAllUsers:", error);
        throw new Error("Failed to fetch users from database");
    }
}