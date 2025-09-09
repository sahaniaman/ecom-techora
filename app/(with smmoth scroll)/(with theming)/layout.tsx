import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";

export default function ThemedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeToggleButton
        variant="circle"
        start="top-right"
        blur={true}
        className="size-7 fixed top-10 right-8 z-50"
      />
      {children}
    </>
  );
}
