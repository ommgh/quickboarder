import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function CTA() {
  return (
    <section className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ready to Transform Your Product Management?
        </h2>
        <p className="max-w-[800px] md:text-xl">
          Join thousands of e-commerce businesses using QuickBoarder to streamline their product listings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
          >
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
        <p className="text-sm opacity-80">No credit card required • Free 14-day trial • Cancel anytime</p>
      </div>
    </div>
  </section>
  )
}
