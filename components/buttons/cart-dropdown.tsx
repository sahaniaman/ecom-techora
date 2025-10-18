"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingCart, 
  IndianRupee, 
  Trash2,
  Eye,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag
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
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

// Cart item type - Updated to match your API response
interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
  product?: Product; // This will be populated from API
}

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart items with product details
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isSignedIn) {
        setCartItems([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/cart");
        const data = await response.json();
        
        if (data.success) {
          // Ensure we have proper product data structure
          const itemsWithProducts = data.data.map((item: any) => ({
            ...item,
            product: item.product || {
              _id: item.productId,
              name: "Product",
              basePrice: 0,
              discountedPrice: 0,
              stock: 0,
              images: []
            }
          }));
          setCartItems(itemsWithProducts);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [isSignedIn]);

  const handleRemoveFromCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newQuantity < 1) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  // Safe calculation of totals with proper error handling
  const { totalItems, subtotal } = cartItems.reduce(
    (acc, item) => {
      try {
        // Safe access to product properties with fallbacks
        const basePrice = item.product?.basePrice || 0;
        const discountedPrice = item.product?.discountedPrice;
        const price = discountedPrice && discountedPrice < basePrice ? discountedPrice : basePrice;
        const itemTotal = price * item.quantity;
        
        return {
          totalItems: acc.totalItems + item.quantity,
          subtotal: acc.subtotal + itemTotal,
        };
      } catch (error) {
        console.error("Error calculating item total:", error, item);
        return acc; // Return accumulator unchanged if there's an error
      }
    },
    { totalItems: 0, subtotal: 0 }
  );

  // Safe price display function
  const getProductPrice = (item: CartItem) => {
    const basePrice = item.product?.basePrice || 0;
    const discountedPrice = item.product?.discountedPrice;
    
    if (discountedPrice && discountedPrice < basePrice) {
      return discountedPrice;
    }
    return basePrice;
  };

  // Safe product name and image
  const getProductName = (item: CartItem) => {
    return item.product?.name || "Product";
  };

  const getProductImage = (item: CartItem) => {
    return item.product?.images?.[0] || "/placeholder-product.jpg";
  };

  const getProductStock = (item: CartItem) => {
    return item.product?.stock || 0;
  };

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <ShoppingCart className="size-5" />
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
          <ShoppingCart className="size-5" />
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
        className="w-96 p-0 max-h-96 overflow-hidden"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ShoppingCart className="size-5 text-blue-500" />
              Shopping Cart
            </h3>
            <span className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading cart...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="size-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some products to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {cartItems.map((item) => {
                const productPrice = getProductPrice(item);
                const basePrice = item.product?.basePrice || productPrice;
                const hasDiscount = item.product?.discountedPrice && item.product.discountedPrice < basePrice;
                
                return (
                  <DropdownMenuItem key={item.productId} asChild>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <Image
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                          width={48}
                          height={48}
                          className="rounded-md object-cover border"
                        />
                        {getProductStock(item) === 0 && (
                          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                            <span className="text-xs text-white font-medium">Sold</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/products/${item.productId}`}
                          onClick={() => setIsOpen(false)}
                          className="block"
                        >
                          <h4 className="font-medium text-sm line-clamp-2 leading-tight hover:text-primary">
                            {getProductName(item)}
                          </h4>
                        </Link>
                        
                        {/* Price */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-green-600 font-semibold text-sm flex items-center">
                            <IndianRupee className="size-3" />
                            {productPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-muted-foreground text-xs line-through flex items-center">
                              <IndianRupee className="size-3" />
                              {basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 hover:bg-muted"
                              onClick={(e) => handleUpdateQuantity(item.productId, item.quantity - 1, e)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 hover:bg-muted"
                              onClick={(e) => handleUpdateQuantity(item.productId, item.quantity + 1, e)}
                              disabled={item.quantity >= getProductStock(item)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <span className="text-xs text-muted-foreground ml-auto">
                            Total: 
                            <span className="font-semibold text-foreground ml-1 flex items-center">
                              <IndianRupee className="size-3" />
                              {(productPrice * item.quantity).toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handleRemoveFromCart(item.productId, e)}
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
                            href={`/products/${item.productId}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <Eye className="size-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Subtotal and Actions */}
        {totalItems > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold text-lg flex items-center">
                  <IndianRupee className="size-4" />
                  {subtotal.toLocaleString()}
                </span>
              </div>

              {/* Shipping Note */}
              <p className="text-xs text-muted-foreground text-center">
                Shipping & taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/cart" className="flex items-center justify-center gap-2">
                    <ShoppingBag className="size-4" />
                    View Cart
                  </Link>
                </Button>
                <Button 
                  className="flex-1"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Checkout
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}