import { ArrowRight, CheckCircle2, Sparkles, Upload, Zap } from 'lucide-react'
import React from 'react'
import { ProcessStep } from './_components/process-step'

export default function Working
() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <Zap className="mr-2 h-4 w-4 text-primary" />
                <span>Simple Process</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How QuickBoarder Works</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl">
                Our streamlined process takes you from product image to e-commerce listing in minutes, not hours.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <ProcessStep
                number="01"
                title="Upload Product"
                description="Upload your product image or barcode depending on your product type."
                icon={<Upload className="h-8 w-8" />}
              />
              <ProcessStep
                number="02"
                title="AI Processing"
                description="Our AI detects products, generates images, titles, and descriptions automatically."
                icon={<Sparkles className="h-8 w-8" />}
              />
              <ProcessStep
                number="03"
                title="Review & Edit"
                description="Select your preferred image and edit the generated content if needed."
                icon={<CheckCircle2 className="h-8 w-8" />}
              />
              <ProcessStep
                number="04"
                title="Export & Publish"
                description="Export your product catalog to your preferred e-commerce platform."
                icon={<ArrowRight className="h-8 w-8" />}
              />
            </div>

            
          </div>
        </section>
  )
}
