import { Package } from 'lucide-react'
import React from 'react'
import { PricingCard } from './_components/pricing-card'

export default function Pricing() {
  return (
    <section id="pricing" className="bg-muted/40 py-16 md:py-24">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
          <Package className="mr-2 h-4 w-4 text-primary" />
          <span>Simple Pricing</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Choose Your Plan</h2>
        <p className="max-w-[800px] text-muted-foreground md:text-xl">
          Flexible pricing options for businesses of all sizes. Start free, upgrade as you grow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PricingCard
          title="Starter"
          price="$0"
          description="Perfect for trying out QuickBoarder"
          features={[
            "50 product uploads per month",
            "Basic AI image generation",
            "Standard product descriptions",
            "Export to 1 platform",
            "Email support",
          ]}
          buttonText="Start for Free"
          buttonVariant="outline"
        />
        <PricingCard
          title="Professional"
          price="$49"
          description="For growing e-commerce businesses"
          features={[
            "500 product uploads per month",
            "Advanced AI image generation",
            "SEO-optimized descriptions",
            "Export to 5 platforms",
            "Priority support",
            "Analytics dashboard",
          ]}
          buttonText="Get Started"
          buttonVariant="default"
          popular={true}
        />
        <PricingCard
          title="Enterprise"
          price="$199"
          description="For large-scale operations"
          features={[
            "Unlimited product uploads",
            "Premium AI image generation",
            "Custom AI training",
            "Export to unlimited platforms",
            "24/7 dedicated support",
            "Advanced analytics",
            "API access",
          ]}
          buttonText="Contact Sales"
          buttonVariant="outline"
        />
      </div>
    </div>
  </section>
  )
}
