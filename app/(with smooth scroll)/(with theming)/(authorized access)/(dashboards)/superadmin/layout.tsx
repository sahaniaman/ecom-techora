import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import SuperAdminDashboardSideBar from "@/components/sidebars/SuperAdminDashboardSideBar"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"

const layout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser()

  // Redirect if the user is not logged in OR if the user is not a SUPER_ADMIN
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  return (
  <>
    <SuperAdminDashboardSideBar/>

      <main className="h-full w-full">
        <header
        className={cn(
          "block w-full sticky top-0 left-0 right-0 py-3.5 pl-4 pr-10",
          "flex items-center justify-between ",
        )}
      >
        <div className="flex items-center gap-10">
        <SidebarTrigger/>
        {/* Logo and search - simplified for mobile */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
            <Sparkles className="text-foreground w-4 h-4" />
          </div>
          <span className="text-xl font-mono font-semibold text-foreground">
            TechOra
          </span>
        </Link>
        </div>


        <div className="flex items-center gap-4">
          <Link
            href={"/"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Home
          </Link>
          <Link
            href={
              user.role === "SUPER_ADMIN"
                ? "/superadmin"
                : user.role === "ADMIN"
                  ? "/admin"
                  : "/profile"
            }
            className={cn(buttonVariants({ variant: "default" }))}
          >
            {user.role === "USER" ? "Profile" : "Dashboard"}
          </Link>
        </div>
      </header>
        {children}
        
        </main>
    </>    
  )
}

export default layout