"use client";

import Hero from "./hero";
import Features from "./features";
import Working from "./working";
import Testimonials from "./testimonials";
import Pricing from "./pricing";
import FAQ from "./faq";
import CTA from "./cta";
import Footer from "./footer";
import { HeroHeader } from "./header";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <HeroHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Working />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
