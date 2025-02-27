import { BarChart, Box, ImageIcon, Package, Sparkles, Zap } from 'lucide-react'
import React from 'react'
import { FeatureCard } from './_components/feature-card'

export default function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">AI-Powered Product Management</h2>
            <p className="max-w-[800px] text-muted-foreground md:text-xl">
              QuickBoarder combines computer vision and natural language processing to streamline your product listing
              workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<ImageIcon className="h-10 w-10 text-primary" />}
              title="Unorganized Product Detection"
              description="Upload any product image and our AI will detect, isolate, and generate multiple angles of your product automatically."
            />
            <FeatureCard
              icon={<Box className="h-10 w-10 text-primary" />}
              title="Barcode Recognition"
              description="For organized products, simply scan the barcode and we'll fetch all relevant product information from online sources."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-primary" />}
              title="AI Content Generation"
              description="Generate compelling product titles and descriptions optimized for e-commerce with our advanced language models."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Batch Processing"
              description="Process multiple products simultaneously to save time and streamline your workflow."
            />
            <FeatureCard
              icon={<Package className="h-10 w-10 text-primary" />}
              title="Product Catalog Management"
              description="Organize, edit, and export your product catalog to any e-commerce platform with a single click."
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-primary" />}
              title="Analytics Dashboard"
              description="Track your product processing metrics and optimize your workflow with detailed analytics."
            />
          </div>
        </section>
  )
}
