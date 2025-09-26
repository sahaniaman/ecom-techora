"use client";

import ProductSlider from "@/components/sliders/ProductSlider";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/wrappers/SectionWrapper";
import type { Product } from "@/types/product";
import { ProductCategory } from "@/types/product";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    description: "Latest flagship smartphone with titanium design",
    basePrice: 129900,
    discountedPrice: 119900,
    discount: 8,
    category: ProductCategory.PREMIUM_PHONES,
    subcategory: "flagship",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
    ],
    stock: 25,
    sku: "APPIP15PM256",
    lowStockThreshold: 5,
    salesCount: 150,
    reservedStock: 3,
    variants: [],
    brand: "Apple",
    features: ["Titanium design", "A17 Pro chip", "48MP Camera"],
    specifications: {},
    tags: ["flagship", "premium"],
    status: "ACTIVE",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    description: "Powerful Android flagship with S Pen",
    basePrice: 119999,
    discountedPrice: 109999,
    discount: 8,
    category: ProductCategory.PREMIUM_PHONES,
    subcategory: "flagship",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
    ],
    stock: 18,
    sku: "SAMGS24U512",
    lowStockThreshold: 5,
    salesCount: 95,
    reservedStock: 2,
    variants: [],
    brand: "Samsung",
    features: ["S Pen", "200MP camera", "Galaxy AI"],
    specifications: {},
    tags: ["android", "flagship"],
    status: "ACTIVE",
    isFeatured: true,
    rating: 4.7,
    reviewCount: 67,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Wireless Charging Pad",
    description: "Fast wireless charging for all devices",
    basePrice: 2999,
    discountedPrice: 2499,
    discount: 17,
    category: ProductCategory.MOBILE_ACCESSORIES,
    subcategory: "chargers",
    images: [
      "https://images.unsplash.com/photo-1609592810793-abeb6c64b5c6?w=400&h=300&fit=crop",
    ],
    stock: 50,
    sku: "ACCWCP15W",
    lowStockThreshold: 10,
    salesCount: 210,
    reservedStock: 5,
    variants: [],
    brand: "Anker",
    features: ["15W Fast charging", "LED indicator"],
    specifications: {},
    tags: ["charging", "wireless"],
    status: "ACTIVE",
    isFeatured: false,
    rating: 4.5,
    reviewCount: 156,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Noise Cancelling Headphones",
    description: "Premium over-ear headphones with ANC",
    basePrice: 19900,
    discountedPrice: 17900,
    discount: 10,
    category: ProductCategory.GADGETS,
    subcategory: "audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    ],
    stock: 2,
    sku: "GADHPNC50",
    lowStockThreshold: 5,
    salesCount: 78,
    reservedStock: 2,
    variants: [],
    brand: "Sony",
    features: ["Active noise cancellation", "30-hour battery"],
    specifications: {},
    tags: ["audio", "headphones"],
    status: "ACTIVE",
    isFeatured: true,
    rating: 4.6,
    reviewCount: 134,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "iPhone 15 Pro Max",
    description: "Latest flagship smartphone with titanium design",
    basePrice: 129900,
    discountedPrice: 119900,
    discount: 8,
    category: ProductCategory.PREMIUM_PHONES,
    subcategory: "flagship",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
    ],
    stock: 25,
    sku: "APPIP15PM256",
    lowStockThreshold: 5,
    salesCount: 150,
    reservedStock: 3,
    variants: [],
    brand: "Apple",
    features: ["Titanium design", "A17 Pro chip", "48MP Camera"],
    specifications: {},
    tags: ["flagship", "premium"],
    status: "ACTIVE",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function NewProducts() {
  const handleAddToCart = (product: Product) => {
    console.log("Added to cart:", product.name);
  };

  const handleToggleWishlist = (product: Product) => {
    console.log("Toggled wishlist for:", product.name);
  };

  return (
    <SectionWrapper
      maxWidth="9xl"
      padding="xl"
      navbarSpacing="none"
      background="transparent"
      className="pointer-events-auto w-full flex items-center justify-center "
    >
      <div className="flex w-full items-center justify-center gap-2 max-w-8xl">
        <h3 className="text-3xl min-w-max font-mono font-semibold">
          New Products
        </h3>{" "}
        <div className="h-0 border-y-[0.5px] border-accent w-full"></div>{" "}
        <Button size={"lg"}>View All</Button>
      </div>
      <ProductSlider
        products={mockProducts}
        autoplay={true}
        autoplayDuration={4000}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />
    </SectionWrapper>
  );
}

export default NewProducts;
