import BannerSlider from "@/components/sliders/BannerSlider";
import SectionWrapper from "@/components/wrappers/SectionWrapper";
import { ImageUrls } from "@/data/to-be-added-to-db";

export default function HomepageHeroSection() {
  return (
    <SectionWrapper
      maxWidth="8xl"
      background="transparent"
      navbarSpacing="none"
      padding="none"
      className="flex flex-col items-center justify-start pointer-events-auto w-full"
    >
      <div className="flex w-full items-start justify-center relative pt-2 md:bt-6 md:pb-12 pb-8 md:px-6 lg:pt-12 lg:pb-20 lg:px-12 px-2 animate-fade-in">
        <BannerSlider
          imageUrls={ImageUrls}
          interval={4000}
          // height={560}
          showDots={true}
        />
      </div>
    </SectionWrapper>
  );
}
