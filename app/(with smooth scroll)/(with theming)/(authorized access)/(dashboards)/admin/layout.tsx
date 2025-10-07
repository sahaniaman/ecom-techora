import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { getCurrentUser } from "@/lib/auth"

const layout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser()

  // Redirect if the user is not logged in OR if the user is not a SUPER_ADMIN
  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div>
      {children}
    </div>
  )
}

export default layout