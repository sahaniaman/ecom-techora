// @/components/tables/UserDataTable.tsx
"use client"

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { columns, type SimpleUser } from "./Columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Users, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserDataTableProps {
  data: SimpleUser[]
}

export default function UserDataTable({ data }: UserDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [roleFilter, setRoleFilter] = React.useState<string>("all")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  // Filter by role
  React.useEffect(() => {
    if (roleFilter === "all") {
      table.getColumn("role")?.setFilterValue(undefined)
    } else {
      table.getColumn("role")?.setFilterValue(roleFilter)
    }
  }, [roleFilter, table])

  // Stats
  const totalUsers = data.length
  const superAdmins = data.filter(u => u.role === "SUPER_ADMIN").length
  const admins = data.filter(u => u.role === "ADMIN").length
  const vendors = data.filter(u => u.role === "VENDOR").length
  const regularUsers = data.filter(u => u.role === "USER").length

  return (
    <div className="w-full space-y-4">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-bold mt-2">{totalUsers}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
          <p className="text-2xl font-bold mt-2 text-red-600">{superAdmins}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">{admins}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground">Vendors</p>
          <p className="text-2xl font-bold mt-2 text-gray-600">{vendors}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground">Users</p>
          <p className="text-2xl font-bold mt-2 text-green-600">{regularUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="VENDOR">Vendor</SelectItem>
            <SelectItem value="USER">User</SelectItem>
          </SelectContent>
        </Select>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Badge variant="secondary">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {totalUsers} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
