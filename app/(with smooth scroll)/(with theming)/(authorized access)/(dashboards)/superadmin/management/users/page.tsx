import getAllUsers from "@/data/users/superadmin/getAllUsers"
import UserDataTable from "@/components/tables/UserDataTable"
import SectionWrapper from "@/components/wrappers/SectionWrapper"
import { Users, ShieldCheck, Store } from "lucide-react"
import type { UserRole } from "@/types/User"

interface PageProps {
    searchParams: {
        role?: string
    }
}

const page = async ({ searchParams }: PageProps) => {
    try {
        const allUsers = await getAllUsers()
        const roleFilter = searchParams.role as UserRole | undefined
        
        // Filter users based on role query parameter
        let filteredUsers = allUsers
        let pageTitle = "User Management"
        let pageDescription = "Manage all users, admins, and vendors in your system"
        let iconColor = "blue"
        let PageIcon = Users
        
        if (roleFilter === "ADMIN") {
            filteredUsers = allUsers.filter(user => 
                user.role === "ADMIN" || user.role === "SUPER_ADMIN"
            )
            pageTitle = "Admin Management"
            pageDescription = "Manage all administrators and super administrators"
            iconColor = "blue"
            PageIcon = ShieldCheck
        } else if (roleFilter === "VENDOR") {
            filteredUsers = allUsers.filter(user => user.role === "VENDOR")
            pageTitle = "Vendor Management"
            pageDescription = "Manage all vendors and their store information"
            iconColor = "purple"
            PageIcon = Store
        }
        
        console.log(`✅ Successfully fetched ${filteredUsers.length} users (filter: ${roleFilter || 'all'})`)
        
        return (
            <SectionWrapper
                navbarSpacing="none"
                maxWidth="full"
                padding="md"
                background="transparent"
                className={`min-h-screen w-full bg-gradient-to-br ${
                    iconColor === "purple"
                        ? "from-purple-50 via-purple-50 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20"
                        : "from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20"
                }`}
            >
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${
                            iconColor === "purple"
                                ? "bg-purple-500/10 dark:bg-purple-500/20"
                                : "bg-blue-500/10 dark:bg-blue-500/20"
                        }`}>
                            <PageIcon className={`h-6 w-6 ${
                                iconColor === "purple"
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-blue-600 dark:text-blue-400"
                            }`} />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${
                                iconColor === "purple"
                                    ? "from-purple-900 to-purple-600 dark:from-purple-100 dark:to-purple-400"
                                    : "from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
                            } bg-clip-text text-transparent`}>
                                {pageTitle}
                            </h1>
                            <p className="text-muted-foreground">
                                {pageDescription}
                            </p>
                        </div>
                    </div>

                    {/* Data Table */}
                    <UserDataTable data={filteredUsers} />
                </div>
            </SectionWrapper>
        )
    } catch (error) {
        console.error("❌ Error fetching users:", error)
        
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold text-red-600">Error Loading Users</h1>
                <p className="mt-2 text-gray-600">
                    {error instanceof Error ? error.message : "Failed to load users"}
                </p>
                <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">
                        Technical Details
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                        {error instanceof Error ? error.stack : String(error)}
                    </pre>
                </details>
            </div>
        )
    }
}

export default page
