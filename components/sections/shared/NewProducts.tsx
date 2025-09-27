"use client";

import Link from "next/link";
import ProductSlider from "@/components/sliders/ProductSlider";
import { buttonVariants } from "@/components/ui/button";
import SectionWrapper from "@/components/wrappers/SectionWrapper";
import { mockProducts } from "@/data/to-be-added-to-db";
import type { Product } from "@/types/product";

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
        <Link
          className={buttonVariants({ variant: "default", size: "lg" })}
          href={"/products"}
        >
          View All
        </Link>
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
