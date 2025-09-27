// @components/pages/Homepage.tsx

import HomepageHeroSection from "../sections/homepage/HeroSection";
import NewProducts from "../sections/shared/NewProducts";

function Homepage() {
  return (
    <>
      <HomepageHeroSection />
      <NewProducts />
    </>
  );
}

export default Homepage;
