// @components/pages/Homepage.tsx

import HomepageHeroSection from "../sections/homepage/HeroSection";
import NewProducts from "../sections/shared/NewProducts";
import SectionWrapper from "../wrappers/SectionWrapper";

function Homepage() {
  return (
    <SectionWrapper
      maxWidth="full"
      background="transparent"
      navbarSpacing="none"
      padding="none"
      className="flex flex-col items-center justify-start min-h-screen pointer-events-auto w-full"
    >
      <HomepageHeroSection />
      <NewProducts />
    </SectionWrapper>
  );
}

export default Homepage;
