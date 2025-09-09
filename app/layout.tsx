import type { Metadata } from "next";
import "./globals.css";
import { Funnel_Display } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const funnel = Funnel_Display({
  variable: "--font-funnel",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickBoarder - AI Product Dashboard",
  description:
    "Upload product images and let AI generate product details for your e-commerce store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${funnel.variable} antialiased`}>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
