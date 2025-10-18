"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  ShoppingBag, 
  IndianRupee, 
  Trash2,
  Eye,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

export function WishlistDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { wishlist, toggleWishlist, isLoading } = useWishlist();
  const { isSignedIn } = useAuth();
  
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Fetch wishlist products details
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }

      try {
        const response = await fetch(`/api/products?ids=${wishlist.join(",")}`);
        const data = await response.json();
        
        if (data.success) {
          setWishlistProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const handleRemoveFromWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const totalItems = wishlistProducts.length;

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Heart className="size-5" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-red-500 text-white flex items-center justify-center">
          0
        </Badge>
      </Link>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Heart className="size-5" />
          <Badge className={cn(
            "absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center transition-colors",
            totalItems > 0 
              ? "bg-red-500 text-white" 
              : "bg-muted text-muted-foreground"
          )}>
            {totalItems}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 max-h-96 overflow-hidden"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Heart className="size-5 text-red-500" />
              My Wishlist
            </h3>
            <span className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading wishlist...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="p-8 text-center">
              <Heart className="size-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start adding products you love!
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {wishlistProducts.map((product) => (
                <DropdownMenuItem key={product._id as string} asChild>
                  <Link
                    href={`/products/${product._id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <Image
                        src={product.images?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover border"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                          <span className="text-xs text-white font-medium">Sold</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      
                      {/* Price */}
                      <div className="flex items-center gap-1 mt-1">
                        {product.discountedPrice && product.discountedPrice < product.basePrice ? (
                          <>
                            <span className="text-green-600 font-semibold text-sm flex items-center">
                              <IndianRupee className="size-3" />
                              {product.discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-xs line-through flex items-center">
                              <IndianRupee className="size-3" />
                              {product.basePrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-sm flex items-center">
                            <IndianRupee className="size-3" />
                            {product.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          product.stock === 0 
                            ? "bg-destructive" 
                            : product.stock <= (product.lowStockThreshold || 5)
                            ? "bg-orange-500 animate-pulse"
                            : "bg-green-500"
                        )} />
                        <span className={cn(
                          "text-xs",
                          product.stock === 0 
                            ? "text-destructive" 
                            : product.stock <= (product.lowStockThreshold || 5)
                            ? "text-orange-600"
                            : "text-green-600"
                        )}>
                          {product.stock === 0 
                            ? "Out of stock" 
                            : product.stock <= (product.lowStockThreshold || 5)
                            ? `Only ${product.stock} left`
                            : "In stock"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleRemoveFromWishlist(product, e)}
                        disabled={isLoading}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        asChild
                      >
                        <Link 
                          href={`/products/${product._id}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Eye className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <Button 
                className="w-full" 
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/wishlist" className="flex items-center justify-center gap-2">
                  <ShoppingBag className="size-4" />
                  View All Wishlist Items
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}