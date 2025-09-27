/** biome-ignore-all lint/a11y/noStaticElementInteractions: explanation */

"use client";

import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import * as React from "react";
import ProductCard from "@/components/cards/ProductCard";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductSliderProps {
  products: Product[];
  autoplay?: boolean;
  autoplayDuration?: number;
  showControls?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

function ProductSlider({
  products,
  autoplay = true,
  autoplayDuration = 4000,
  showControls = true,
  className,
  onAddToCart,
  onToggleWishlist,
}: ProductSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isPlaying, setIsPlaying] = React.useState(autoplay);
  const [isHovered, setIsHovered] = React.useState(false);

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: autoplayDuration,
      stopOnInteraction: false,
    }),
  );

  // Handle hover state for autoplay pause/resume
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isPlaying) {
      autoplayPlugin.current.stop();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isPlaying) {
      autoplayPlugin.current.play();
    }
  };

  // Auto-play control
  React.useEffect(() => {
    if (!api) return;

    if (isPlaying && autoplay && !isHovered) {
      autoplayPlugin.current.play();
    } else {
      autoplayPlugin.current.stop();
    }
  }, [api, isPlaying, autoplay, isHovered]);

  // Reset playing state when autoplay prop changes
  React.useEffect(() => {
    setIsPlaying(autoplay);
  }, [autoplay]);

  const nextSlide = () => {
    api?.scrollNext();
  };

  const prevSlide = () => {
    api?.scrollPrev();
  };

  if (products.length === 0) {
    return (
      <div className={cn("w-full py-12 text-center", className)}>
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  const visibleProducts = 4;

  return (
    <div
      className={cn("w-full py-8", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-8xl mx-auto">
        <div className="relative">
          <Carousel
            setApi={setApi}
            plugins={autoplay ? [autoplayPlugin.current] : []}
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {products.map((product, index) => (
                <CarouselItem
                  key={product.id}
                  className="pl-2 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-2"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onToggleWishlist={onToggleWishlist}
                      size="md"
                      className="h-full"
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {showControls && products.length > visibleProducts && (
              <>
                <CarouselPrevious
                  className="-left-3 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background border"
                  onClick={prevSlide}
                />
                <CarouselNext
                  className="-right-3 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background border"
                  onClick={nextSlide}
                />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductSlider);
