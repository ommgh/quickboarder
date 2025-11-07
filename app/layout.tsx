import { Inter, DM_Sans } from "next/font/google";

import type { Metadata } from "next";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { StyleGlideProvider } from "@/components/styleglide-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Quickboarder - Get your products e-commerce ready",
    template: "%s | Quickboarder",
  },
  description:
    "Quickboarder is a tool that helps you get your products e-commerce ready in minutes. Generate product descriptions, titles, and more with the power of AI.",
  keywords: [
    "e-commerce",
    "shopify",
    "ai",
    "enhance",
    "image generation",
    "product",
    "presentation",
    "shopping",
    "business",
    "online store",
    "marketing",
    "ai tools",
    "models",
  ],
  authors: [{ name: "quickboarder.shop" }],
  creator: "quickboarder.shop",
  publisher: "quickboarder.shop",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: "Quickboarder - Get your products e-commerce ready",
    description:
      "Quickboarder is a tool that helps you get your products e-commerce ready in minutes. Generate product descriptions, titles, and more with the power of AI.",
    siteName: "Quickboarder",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quickboarder - Get your products e-commerce ready",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quickboarder - Get your products e-commerce ready",
    description:
      "Quickboarder is a tool that helps you get your products e-commerce ready in minutes. Generate product descriptions, titles, and more with the power of AI.",
    images: ["/og-image.png"],
    creator: "@ommshx",
  },
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
        <head>
          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        </head>
        <body className={`${dmSans.variable} ${inter.variable} antialiased`}>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="light"
            disableTransitionOnChange
          >
            <StyleGlideProvider />
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
