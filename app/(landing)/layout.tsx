import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { StyleGlideProvider } from "@/components/styleglide-provider";
import "@/styles/globals.css";
export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StyleGlideProvider />
      <Navbar />
      <main className="">{children}</main>
      <Footer />
    </>
  );
}
