import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function LayoutWithNavbarAndFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
