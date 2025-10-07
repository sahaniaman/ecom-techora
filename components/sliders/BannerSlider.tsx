/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: hello */
/** biome-ignore-all lint/a11y/useSemanticElements: hello */
/** biome-ignore-all lint/a11y/noRedundantRoles: hello */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface BannerSliderProps {
  imageUrls: string[];
  interval?: number; // ms
  height?: number | string; // default 560 - ab optional
  showDots?: boolean;
}

export default function BannerSlider({
  imageUrls = [],
  interval = 4000,
  height, // ab optional - agar nahi diya gaya toh aspect-video ka use karega
  showDots = false,
}: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const length = imageUrls?.length || 0;

  // interval management
  useEffect(() => {
    if (length === 0) return;

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPaused) {
      timerRef.current = window.setInterval(() => {
        setCurrent((prev) => (prev + 1) % length);
      }, interval);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [length, interval, isPaused]);

  // keyboard navigation
  useEffect(() => {
    if (length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrent((p) => (p + 1) % length);
      } else if (e.key === "ArrowLeft") {
        setCurrent((p) => (p - 1 + length) % length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [length]);

  // preload next
  useEffect(() => {
    if (length === 0) return;
    const nextIndex = (current + 1) % length;
    const img = new window.Image();
    img.src = imageUrls[nextIndex];
  }, [current, imageUrls, length]);

  const next = () => setCurrent((p) => (p + 1) % length);
  const prev = () => setCurrent((p) => (p - 1 + length) % length);

  if (length === 0) {
    return (
      <section
        aria-label="Promotional carousel"
        className={`w-full  rounded-xl bg-muted flex items-center justify-center text-muted-foreground ${height ? '' : 'aspect-video'}`}
        style={height ? { height } : {}}
      >
        No banners
      </section>
    );
  }

  return (
    <section
      role="region"
      aria-label="Promotional carousel"
      tabIndex={0}
      className={`relative group w-full overflow-hidden rounded-xl shadow-soft-lg hover-lift border max-h-[560px] ${height ? '' : 'aspect-video'}`}
      style={height ? { height } : {}}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 ">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`slide-${current}-${imageUrls[current] ?? current}`}
            className="absolute inset-0 "
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="relative w-full h-full max-h-[560px]">
              <Image
                src={imageUrls[current]}
                alt={`Slide ${current + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
                className="object-cover"
                priority={true}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        aria-label="Previous slide"
        onClick={prev}
        className="absolute duration-500 transition-all opacity-0 group-hover:opacity-100 left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-card-strong hover:shadow-glow-primary hover-scale p-1 md:p-2 text-white focus-visible-ring"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      <Button
        aria-label="Next slide"
        onClick={next}
        className="absolute duration-500 transition-all opacity-0 group-hover:opacity-100 right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-card-strong hover:shadow-glow-primary hover-scale p-1 md:p-2 text-white focus-visible-ring"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {showDots && (
        <div className="absolute duration-500 transition-all opacity-0 group-hover:opacity-100 bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20  gap-1 md:gap-2">
          {imageUrls.map((url, i) => (
            <Button
              key={`${i}-${url}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-1.5 md:h-2 w-6 md:w-8 rounded-full transition-all hover-scale p-0 min-w-0 mr-2 ${current === i ? "bg-background shadow-glow-primary" : "bg-background/40 hover:bg-background/60"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}