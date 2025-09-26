import BannerSlider from "@/components/sliders/BannerSlider";
import { ImageUrls } from "@/data/to-be-added-to-db";

export default function HomepageHeroSection() {
  return (
    <div className="flex w-full items-start justify-center relative pt-12 pb-20 px-12">
      <div className="w-full max-w-[1400px]">
        <BannerSlider
          imageUrls={ImageUrls}
          interval={4000}
          height={560}
          showDots={true}
        />
      </div>
    </div>
  );
}
