"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCategory } from "@/types/product";
import { ProductCard } from "@/components/cards/ProductCard";
import { mockProducts } from "@/data/to-be-added-to-db";
import ProductGridClient from "@/components/products/ProductGridClient";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: ProductCategory.MOBILE_ACCESSORIES, label: "Mobile Accessories" },
  { value: ProductCategory.PREMIUM_PHONES, label: "Premium Phones" },
  { value: ProductCategory.REFURBISHED_PHONES, label: "Refurbished Phones" },
  { value: ProductCategory.GADGETS, label: "Gadgets" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "name", label: "Name (A-Z)" },
  { value: "price-low", label: "Price (Low to High)" },
  { value: "price-high", label: "Price (High to Low)" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(mockProducts);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Initialize price range based on products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => p.basePrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter,
      );
    }

    // Apply price filter
    filtered = filtered.filter(
      (product) =>
        product.basePrice >= priceRange[0] &&
        product.basePrice <= priceRange[1],
    );

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.basePrice - b.basePrice;
        case "price-high":
          return b.basePrice - a.basePrice;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default: // relevance
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryFilter, priceRange, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPriceRange([0, 200000]);
    setSortBy("relevance");
  };

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 200000;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Our Products</h1>
            <p className="text-muted-foreground">
              Discover {products.length} amazing products in our collection
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" className="gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Search: "{searchQuery}"
                </span>
              )}
              {categoryFilter !== "all" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {
                    categoryOptions.find((c) => c.value === categoryFilter)
                      ?.label
                  }
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 200000) && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  NPR {priceRange[0].toLocaleString()} -{" "}
                  {priceRange[1].toLocaleString()}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Category
                  </Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-4 block">
                    Price Range: NPR {priceRange[0].toLocaleString()} -{" "}
                    {priceRange[1].toLocaleString()}
                  </Label>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={200000}
                      min={0}
                      step={1000}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Sort By
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Collection Stats</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Products
                    </span>
                    <span className="font-medium">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On Sale</span>
                    <span className="font-medium">
                      {products.filter((p) => p.discount > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Featured</span>
                    <span className="font-medium">
                      {products.filter((p) => p.isFeatured).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brands</span>
                    <span className="font-medium">
                      {new Set(products.map((p) => p.brand)).size}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </div>
              <div className="text-sm text-muted-foreground">
                Sorted by: {sortOptions.find((s) => s.value === sortBy)?.label}
              </div>
            </div>

            {/* Products */}
            <ProductGridClient
              filteredProducts={filteredProducts}
              searchQuery={searchQuery}
              clearAllFilters={clearAllFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              className="my-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
