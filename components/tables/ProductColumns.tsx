"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Star } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  discountedPrice: number;
  discount: number;
  brand: string;
  category: { _id: string; name: string; slug: string } | string;
  images: string[];
  stock: number;
  sku: string;
  lowStockThreshold: number;
  salesCount: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      return (
        <div className="flex items-center">
          {images?.[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={images[0]}
              alt={row.getValue("name")}
              className="h-12 w-12 rounded-md object-cover border"
            />
          ) : (
            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const isFeatured = row.original.isFeatured;
      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium flex items-center gap-2">
              {name}
              {isFeatured && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              SKU: {row.original.sku}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <div className="font-medium">{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as { name: string } | string | null;
      
      if (!category) {
        return <Badge variant="outline">No Category</Badge>;
      }
      
      return (
        <Badge variant="outline">
          {typeof category === "string" ? category : category.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "basePrice",
    header: "Price",
    cell: ({ row }) => {
      const basePrice = row.getValue("basePrice") as number;
      const discountedPrice = row.original.discountedPrice;
      const hasDiscount = basePrice !== discountedPrice;

      return (
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="font-medium text-green-600">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="text-xs line-through text-muted-foreground">
                ${basePrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const lowStockThreshold = row.original.lowStockThreshold;
      const isLowStock = stock <= lowStockThreshold && stock > 0;
      const isOutOfStock = stock === 0;

      return (
        <Badge
          variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}
          className={isLowStock ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""}
        >
          {stock} units
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "ACTIVE"
          ? "default"
          : status === "INACTIVE"
          ? "secondary"
          : "destructive";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      const totalReviews = row.original.totalReviews;
      return (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({totalReviews})</span>
        </div>
      );
    },
  },
  {
    accessorKey: "salesCount",
    header: "Sales",
    cell: ({ row }) => {
      const sales = row.getValue("salesCount") as number;
      return <span className="font-medium">{sales}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product._id)}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit product
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
