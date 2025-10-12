import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <span className="mr-1 rounded-full bg-primary h-2 w-2"></span>
              <span className="font-medium">Introducing QuickBoarder AI</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transform Product <span className="text-primary">Images</span>{" "}
              into <span className="text-primary">E-commerce</span> Ready
              Listings
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              QuickBoarder uses advanced AI to automatically detect products,
              generate descriptions, and prepare them for your online store.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free 14-day trial</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
