// @/data/users/superadmin/getAllUsers.ts
import { getCurrentUser } from "@/lib/auth";
import type { UserRole } from "@/types/User";

export default async function getAllUsers(role?: UserRole) {
    try {
        console.log(`🔍 getAllUsers called - Filter: ${role || 'all'}`);

        const RequestUser = await getCurrentUser();

        if (!RequestUser) {
            throw new Error("Authentication required: No user found in session");
        }

        if (RequestUser.role !== "SUPER_ADMIN") {
            throw new Error(
                `Authorization failed: User role is ${RequestUser.role}, but SUPER_ADMIN required`,
            );
        }

        // Build URL with role filter
        const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`);
        if (role) {
            url.searchParams.set('role', role);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));

            if (response.status === 401) {
                throw new Error("Authentication required: Please login again");
            } else if (response.status === 403) {
                throw new Error("Authorization failed: SUPER_ADMIN access required");
            } else {
                throw new Error(
                    errorData.error || `HTTP error! status: ${response.status}`,
                );
            }
        }

        const data = await response.json();
        console.log("✅ Users fetched via API:", data.users?.length || 0);

        return data.users || [];
    } catch (error) {
        console.error("❌ Error in getAllUsers:", error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Failed to fetch users from server");
    }
}