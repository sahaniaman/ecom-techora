import SectionWrapper from "@/components/wrappers/SectionWrapper";

export default function Home() {
  return (
    <SectionWrapper
      navbarSpacing="loose"
      padding="sm"
      background="transparent"
      maxWidth="full"
      className="flex items-center justify-center h-full w-full gap-2 flex-col "
    >
      <div className="bg-muted min-h-screen flex flex-col items-center justify-between p-10">
        <h1 className="text-6xl max-w-4xl tracking-wide">Hello, Ashutosh</h1>
        <h1 className="text-6xl max-w-4xl tracking-wide">Hello, Ashutosh</h1>
      </div>
    </SectionWrapper>
  );
}
