// /api/users/route.ts

import { type NextRequest, NextResponse } from "next/server";
import type { SimpleUser } from "@/components/tables/Columns";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        console.log("🔍 GET /api/admin/users called");

        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        
        console.log(`🎯 Filtering users by role: ${role || 'all'}`);

        // Build query based on role filter
        let query = {};
        if (role === "ADMIN") {
            query = { role: { $in: ["ADMIN", "SUPER_ADMIN"] } };
        } else if (role === "VENDOR") {
            query = { role: "VENDOR" };
        } else if (role === "USER") {
            query = { role: "USER" };
        }

        // Sirf essential fields fetch karein with filtering
        const users = await User.find(query)
            .select('_id clerkId email phone role profile.firstName profile.lastName profile.avatar')
            .lean();

        console.log(`✅ Users found with filter '${role}':`, users.length);

        // Transform to safe format
        const safeUsers: SimpleUser[] = users.map(user => ({
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

        return NextResponse.json({ users: safeUsers });

    } catch (error) {
        console.error("❌ Error in GET /api/admin/users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users from database" },
            { status: 500 }
        );
    }
}