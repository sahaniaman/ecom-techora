import FluidCursor from "@/components/custom/fluid-cursor";
import SectionWrapper from "@/components/wrappers/SectionWrapper";

export default function Home() {
  return (
    <SectionWrapper
      maxWidth="full"
      background="transparent"
      navbarSpacing="none"
      padding="none"
      className="flex flex-col items-center justify-center min-h-screen w-full pointer-events-auto p-10"
    >
      <div className="relative h-[calc(100vh-5rem)] w-full bg-[#000c27] rounded-[4rem] overflow-hidden border-[1.3rem] border-yellow-100">
        <FluidCursor/>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(#ffffff33_1px,#000c27_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(0,0,0,1)_100%)]"></div>
        <div className="flex flex-col gap-2 items-center justify-center h-full absolute inset-0 w-full z-20 py-20">
          {/* Poppins */}
          <p className="text-[5rem] font-sans-2 font-semibold tracking-tight leading-none scale-75 text-yellow-200">
            Our{" "}
            <span
              className="text-[7rem] uppercase font-sans text-transparent font-black tracking-wide"
              style={{
                backgroundImage: `url("/images/tbg.jpg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitBackgroundClip: "text",
                backgroundBlendMode: "exclusion",
                // WebkitTextStroke: "3px white", // stroke
              }}
            >
              Website
            </span>{" "}
            is Still Cooking
          </p>

          {/* Nunito */}
          <p className="text-yellow-100/80 text-3xl font-sans-3 font-bold tracking-wide">
            We are going to Launch our Website very soon.
          </p>
          <p className="text-yellow-100/80 text-3xl font-sans-3 font-bold tracking-wide">Stay tune.</p>
        </div>

      </div>
    </SectionWrapper>
  );
}
