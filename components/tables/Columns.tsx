// @/components/tables/users/columns.tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Mail, Phone, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRole } from "@/types/User"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useClerkDataOnClient } from "@/hooks/useClerkDataOnClient"

// Simplified User type - sirf essential fields
export interface SimpleUser {
  id: string
  clerkId: string
  email: string
  phone: string
  role: UserRole
  profile: {
    firstName: string
    lastName: string
    avatar: string
  }
}

// Avatar component with proper loading state
const UserAvatar = ({ user }: { user: SimpleUser }) => {
  const { userData, loading } = useClerkDataOnClient({ clerkId: user.clerkId })
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`.trim()
  
  // Avatar URL determine karna with proper fallbacks
  const avatarUrl = user.profile.avatar || userData?.imageUrl || null
  
  // Agar data load ho raha hai to skeleton display karo
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br relative from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName || "User Avatar"}
            fill
            className={cn("object-cover object-center")}
            onError={(e) => {
              // Agar image load nahi hoti to fallback display
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <span className="text-sm">
            {user.profile.firstName?.[0]?.toUpperCase() || '?'}
            {user.profile.lastName?.[0]?.toUpperCase() || ''}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {fullName || "Unknown User"}
        </div>
        <div className="text-xs text-gray-500">
          ID: {user.id.slice(-8)}
        </div>
      </div>
    </div>
  )
}

export const columns: ColumnDef<SimpleUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "profile.firstName",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      return <UserAvatar user={user} />
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{user.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          {user.phone ? (
            <>
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user.phone}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">No phone</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      
      const getRoleConfig = (role: UserRole) => {
        switch (role) {
          case UserRole.SUPER_ADMIN:
            return { variant: "destructive" as const, label: "Super Admin", icon: "👑" }
          case UserRole.ADMIN:
            return { variant: "default" as const, label: "Admin", icon: "⚡" }
          case UserRole.VENDOR:
            return { variant: "secondary" as const, label: "Vendor", icon: "🏪" }
          case UserRole.USER:
            return { variant: "outline" as const, label: "User", icon: "👤" }
          default:
            return { variant: "outline" as const, label: role, icon: "❓" }
        }
      }
      
      const { variant, label, icon } = getRoleConfig(role)
      
      return (
        <Badge variant={variant} className="flex items-center gap-1 w-fit">
          <span>{icon}</span>
          {label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.clerkId)}
            >
              Copy Clerk ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]