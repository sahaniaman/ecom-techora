"use client";

import { Filter, Grid3X3, List } from "lucide-react";
import ProductCard from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductGridClientProps {
  filteredProducts: Product[];
  searchQuery: string;
  clearAllFilters: () => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}

function ProductGridClient({
  filteredProducts,
  searchQuery,
  clearAllFilters,
  viewMode = "grid",
  onViewModeChange,
  className,
}: ProductGridClientProps) {
  if (filteredProducts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No products match "${searchQuery}". Try different keywords or adjust your filters.`
              : "No products match your current filters. Try adjusting your filters."}
          </p>
          <Button onClick={clearAllFilters}>Clear All Filters</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end mb-4">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div
        className={cn(
          "gap-6",
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "space-y-4",
        )}
      >
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size={viewMode === "list" ? "sm" : "md"}
            className={viewMode === "list" ? "flex-row items-center" : ""}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGridClient;
