"use client";

import {
  Check,
  Eye,
  Heart,
  IndianRupee,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";


interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  showFeatures?: boolean;
  size?: "sm" | "md" | "lg";
}

function ProductCardInner({
  product,
  className = "",
  onAddToCart: externalAddToCart,
  onToggleWishlist: externalToggleWishlist,
  isWishlisted: externalIsWishlisted,
  showFeatures = true,
  size = "md",
}: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // Use the wishlist hook
  const { isInWishlist, toggleWishlist, isLoading: isWishlistLoading } = useWishlist();
  // Use the cart hook
  const { addToCart, isLoading: isCartLoading } = useCart();
  

  // Determine wishlist state
  const isWishlisted = externalIsWishlisted !== undefined 
    ? externalIsWishlisted 
    : isInWishlist(product._id as string);

  // Memoized calculations
  const {
    primaryImage,
    discountPercentage,
    hasDiscount,
    isOutOfStock,
    isLowStock,
  } = useMemo(() => {
    const images = Array.isArray(product.images) ? product.images : [];
    const primaryImage = images[0] || "/placeholder-product.jpg";
    const hasDiscount =
      product.discountedPrice && product.discountedPrice < product.basePrice;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.basePrice - product.discountedPrice) / product.basePrice) *
            100,
        )
      : 0;
    const isOutOfStock = product.stock === 0;
    const isLowStock =
      product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

    return {
      images,
      primaryImage,
      discountPercentage,
      hasDiscount,
      isOutOfStock,
      isLowStock,
    };
  }, [product]);

  // Size configurations
  const sizeConfig = {
    sm: {
      image: "aspect-[4/3]",
      title: "text-base font-semibold",
      price: "text-lg",
      padding: "p-3",
    },
    md: {
      image: "aspect-[4/3]",
      title: "text-lg font-semibold",
      price: "text-xl",
      padding: "p-4",
    },
    lg: {
      image: "aspect-[3/4]",
      title: "text-xl font-semibold",
      price: "text-2xl",
      padding: "p-5",
    },
  }[size];

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsAddingToCart(true);
    try {
      // If external handler is provided, use it
      if (externalAddToCart) {
        await externalAddToCart(product);
      } else {
        // Otherwise use the cart hook
        await addToCart(product._id as string, 1);
      }
      
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If external handler is provided, use it
    if (externalToggleWishlist) {
      externalToggleWishlist(product);
      return;
    }

    // Otherwise use the hook
    await toggleWishlist(product);
  };

  // Render stars function
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={`${i}+${i + 1}`}
        className={cn(
          "w-3 h-3",
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-muted-foreground",
        )}
      />
    ));
  };



const priceDisplay = useMemo(
  () => (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        {hasDiscount ? (
          <>
            <span
              className={cn(
                "font-bold text-green-600 flex items-center",
                sizeConfig.price,
              )}
            >
              <IndianRupee className="size-4 mr-0.5" />
              {formatPrice(product.discountedPrice)}
            </span>
            <span className="text-sm line-through text-muted-foreground flex items-center">
              <IndianRupee className="size-3" />
              {formatPrice(product.basePrice)}
            </span>
          </>
        ) : (
          <span
            className={cn(
              "font-bold text-foreground flex items-center",
              sizeConfig.price,
            )}
          >
            <IndianRupee className="size-4 mr-0.5" />
            {formatPrice(product.basePrice)}
          </span>
        )}
      </div>
      {hasDiscount && (
        <Badge
          className="w-fit !bg-green-100 !text-green-700 text-xs"
        >
          {discountPercentage}% OFF
        </Badge>
      )}
    </div>
  ),
  [
    product.basePrice,
    product.discountedPrice,
    hasDiscount,
    discountPercentage,
    sizeConfig.price,
  ],
);
  const stockStatus = useMemo(() => {
    if (isOutOfStock) {
      return {
        text: "Out of Stock",
        color: "text-destructive",
        dot: "bg-destructive",
      };
    }
    if (isLowStock) {
      return {
        text: `Only ${product.stock} left`,
        color: "text-orange-600",
        dot: "bg-orange-500 animate-pulse",
      };
    }
    return {
      text: "In Stock",
      color: "text-green-600",
      dot: "bg-green-500",
    };
  }, [isOutOfStock, isLowStock, product.stock]);

  return (
    <Card
      className={cn(
        "group relative transition-all duration-500 hover:shadow-xl hover-lift border-2 hover:border-primary/20 overflow-hidden py-0.5 hover-scale backdrop-blur-sm",
        isOutOfStock && "opacity-70 grayscale",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className={cn("p-0", sizeConfig.padding)}>
        {/* Image Section */}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted shadow-soft",
            sizeConfig.image,
          )}
        >
          {/* Image */}
          <div className="relative w-full h-full">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                isHovered && "scale-110",
              )}
              onLoad={() => setIsImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />

            {/* Loading State */}
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg animate-pulse" />
              </div>
            )}
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOutOfStock && (
              <Badge
                variant="destructive"
                className="text-xs px-3 py-1 glass-card animate-slide-down"
              >
                Sold Out
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge className="bg-orange-500 text-xs px-3 py-1 glass-card animate-slide-down animate-delay-100">
                Low Stock
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="!bg-green-500 text-green-50 text-xs px-3 py-1 glass-card animate-slide-down animate-delay-100">
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-primary text-primary-foreground text-xs px-3 py-1 glass-card animate-slide-down animate-delay-200">
                Featured
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 z-10">
            <div
              className={cn(
                "flex flex-col gap-2 transition-all duration-300",
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4",
              )}
            >
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "w-9 h-9 rounded-full glass-card hover:shadow-glow-primary hover-scale transition-all duration-300",
                  isWishlistLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleWishlist}
                disabled={isWishlistLoading}
              >
                {isWishlistLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-all duration-300",
                      isWishlisted
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-muted-foreground hover:text-red-500",
                    )}
                  />
                )}
              </Button>

              <Link href={`/product/${product._id}`} prefetch={false}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-9 h-9 rounded-full glass-card hover:shadow-glow-primary hover-scale"
                >
                  <Eye className="w-4 h-4 text-foreground" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Quick View on Mobile */}
          <Link
            href={`/product/${product._id}`}
            className="absolute inset-0 md:hidden"
            prefetch={false}
          />
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-3">
          {/* Brand and Category */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </span>
            <Badge variant="outline" className="text-xs capitalize">
              {/* {product.category.replace(/-/g, " ")} */}
            </Badge>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product._id}`}
            className="block group/title"
            prefetch={false}
          >
            <h3
              className={cn(
                "line-clamp-2 transition-colors hover:text-primary leading-tight",
                sizeConfig.title,
              )}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-sm font-medium ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}

          {/* Features (Optional) */}
          {showFeatures && product.features && product.features.length > 0 && (
            <div className="space-y-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <div
                  key={`${feature}+${index + 1}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {priceDisplay}

            <Button
              size={size === "sm" ? "sm" : "default"}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart || isCartLoading}
              className={cn(
                "rounded-full transition-all duration-300 min-w-[48px] hover-glow shadow-soft",
                isAddedToCart
                  ? "bg-green-500 hover:bg-green-600 scale-110 shadow-glow-accent"
                  : "hover:scale-105 active:scale-95",
              )}
            >
              {isAddingToCart || isCartLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isAddedToCart ? (
                <Check className="w-4 h-4" />
              ) : isOutOfStock ? (
                "Sold Out"
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Stock Status */}
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              stockStatus.color,
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", stockStatus.dot)} />
            {stockStatus.text}
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>1Y Warranty</span>
              </div>
            </div>
            {product.salesCount > 0 && (
              <span>{product.salesCount.toLocaleString()} sold</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardInner);
export default ProductCard;