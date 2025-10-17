import { ShieldCheck, Store, Users } from "lucide-react"
import UserDataTable from "@/components/tables/UserDataTable"
import SectionWrapper from "@/components/wrappers/SectionWrapper"
import getAllUsers from "@/data/users/superadmin/getAllUsers"
import type { UserRole } from "@/types/User"
import type { SimpleUser } from "@/components/tables/Columns"

interface PageProps {
    searchParams: Promise<{
        role?: string
    }>
}

const page = async ({ searchParams }: PageProps) => {
    try {
        const { role } = await searchParams
        const roleFilter = role as UserRole 
        console.log(roleFilter);  

        
        // Directly fetch filtered data from database
        const filteredUsers: SimpleUser[] = await getAllUsers(roleFilter)
        
        let pageTitle = "User Management"
        let pageDescription = "Manage all users, admins, and vendors in your system"
        let iconColor = "blue"
        let PageIcon = Users
        
        if (roleFilter === "ADMIN") {
            pageTitle = "Admin Management"
            pageDescription = "Manage all administrators and super administrators"
            iconColor = "blue"
            PageIcon = ShieldCheck
        } else if (roleFilter === "VENDOR") {
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
                            <p className="text-sm text-muted-foreground mt-1">
                                Showing {filteredUsers.length} {roleFilter?.toLowerCase() || 'user'}{filteredUsers.length !== 1 ? 's' : ''}
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
            <SectionWrapper
                navbarSpacing="none"
                maxWidth="full"
                padding="md"
                background="transparent"
                className="min-h-screen w-full bg-gradient-to-br from-red-50 via-red-50 to-orange-50/30 dark:from-gray-950 dark:via-red-950/20 dark:to-orange-950/20"
            >
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20">
                            <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-900 to-red-600 dark:from-red-100 dark:to-red-400 bg-clip-text text-transparent">
                                Error Loading Users
                            </h1>
                            <p className="text-muted-foreground">
                                {error instanceof Error ? error.message : "Failed to load users"}
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <details>
                            <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-300">
                                Technical Details
                            </summary>
                            <pre className="mt-2 p-3 bg-white dark:bg-gray-900 rounded text-xs overflow-auto border border-red-100 dark:border-red-800">
                                {error instanceof Error ? error.stack : String(error)}
                            </pre>
                        </details>
                    </div>
                </div>
            </SectionWrapper>
        )
    }
}

export default page