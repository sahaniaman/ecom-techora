// @/components/tables/users/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Mail, Phone, Calendar, User as UserIcon } from "lucide-react"
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
import { User, UserRole, UserStatus } from "@/types/User"

export const columns: ColumnDef<User>[] = [
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
    header: "User",
    cell: ({ row }) => {
      const user = row.original
      const fullName = `${user.profile.firstName} ${user.profile.lastName}`.trim()
      
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {user.profile.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm">
                {user.profile.firstName?.[0]}{user.profile.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-gray-900">
              {fullName || "Unknown User"}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex flex-col gap-1">
          {user.phone ? (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="text-sm">{user.phone}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">No phone</span>
          )}
          <div className="flex gap-2">
            {user.emailVerified && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Email Verified
              </Badge>
            )}
            {user.phoneVerified && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Phone Verified
              </Badge>
            )}
          </div>
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
        <Badge variant={variant} className="flex items-center gap-1">
          <span>{icon}</span>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus
      
      const getStatusConfig = (status: UserStatus) => {
        switch (status) {
          case UserStatus.ACTIVE:
            return { variant: "default" as const, label: "Active", className: "bg-green-100 text-green-800 border-green-200" }
          case UserStatus.INACTIVE:
            return { variant: "secondary" as const, label: "Inactive", className: "bg-gray-100 text-gray-800 border-gray-200" }
          case UserStatus.SUSPENDED:
            return { variant: "destructive" as const, label: "Suspended", className: "bg-red-100 text-red-800 border-red-200" }
          case UserStatus.PENDING_VERIFICATION:
            return { variant: "outline" as const, label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
          default:
            return { variant: "outline" as const, label: status, className: "" }
        }
      }
      
      const { label, className } = getStatusConfig(status)
      
      return (
        <Badge variant="outline" className={className}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Joined
          </div>
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date.toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLoginAt = row.getValue("lastLoginAt") as Date
      
      if (!lastLoginAt) {
        return (
          <span className="text-sm text-gray-400">Never</span>
        )
      }
      
      const date = new Date(lastLoginAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date.toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "addresses",
    header: "Location",
    cell: ({ row }) => {
      const addresses = row.getValue("addresses") as Address[]
      const primaryAddress = addresses[0]
      
      if (!primaryAddress) {
        return <span className="text-sm text-gray-400">No address</span>
      }
      
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{primaryAddress.city}</span>
          <span className="text-xs text-gray-500">{primaryAddress.country}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
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
            {user.status === UserStatus.ACTIVE ? (
              <DropdownMenuItem className="text-orange-600">
                Suspend User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600">
                Activate User
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-600">
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]