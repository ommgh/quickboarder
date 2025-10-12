import { CheckCircle2 } from "lucide-react";
import React from "react";
import { TestimonialCard } from "./_components/testimonial-card";

export default function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
          <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
          <span>Customer Success</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Loved by E-commerce Businesses
        </h2>
        <p className="max-w-[800px] text-muted-foreground md:text-xl">
          See how QuickBoarder is transforming product management for online
          retailers.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TestimonialCard
          quote="QuickBoarder cut our product listing time by 80%. What used to take days now takes hours."
          author="Sarah Johnson"
          role="E-commerce Manager"
          company="FashionRetail"
          avatar="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1760301738/quickboarder/uifaces-human-avatar_tv8oad.jpg"
        />
        <TestimonialCard
          quote="The AI-generated descriptions are surprisingly good. We barely need to edit them before publishing."
          author="Michael Chen"
          role="Product Director"
          company="TechGadgets"
          avatar="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1760301733/quickboarder/uifaces-human-avatar_1_cnssee.jpg"
        />
        <TestimonialCard
          quote="Processing product images was always a pain point for us. QuickBoarder solved that completely."
          author="Emma Rodriguez"
          role="Founder"
          company="HomeDecorShop"
          avatar="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1760301740/quickboarder/uifaces-popular-avatar_z3zcq0.jpg"
        />
      </div>

      <div className="mt-16 rounded-lg border bg-muted/30 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className="h-6 w-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
          <p className="text-2xl font-medium">
            4.9/5 average rating from 500+ customers
          </p>
        </div>
      </div>
    </section>
  );
}
