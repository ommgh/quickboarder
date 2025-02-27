import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import React, { SVGProps } from 'react'

export default function FAQ() {
  return (
    <section id="faq" className="container mx-auto px-4 py-16 md:py-24">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
        <QuestionMarkIcon className="mr-2 h-4 w-4 text-primary" />
        <span>FAQ</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
      <p className="max-w-[800px] text-muted-foreground md:text-xl">
        Everything you need to know about QuickBoarder.
      </p>
    </div>

    <div className="mt-12 max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What types of products work best with QuickBoarder?</AccordionTrigger>
          <AccordionContent>
            QuickBoarder works with virtually any physical product. For unorganized products, our AI performs best
            with clear, well-lit images against a simple background. For organized products with barcodes, any
            standard barcode format is supported.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How accurate are the AI-generated descriptions?</AccordionTrigger>
          <AccordionContent>
            Our AI generates descriptions with approximately 90% accuracy based on visual recognition and product
            category understanding. You can always edit and refine the generated content before finalizing your
            listings.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Which e-commerce platforms can I export to?</AccordionTrigger>
          <AccordionContent>
            QuickBoarder supports exports to all major e-commerce platforms including Shopify, WooCommerce,
            Amazon, eBay, Etsy, and more. We provide CSV, JSON, and XML export formats to ensure compatibility
            with any platform.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Is my product data secure?</AccordionTrigger>
          <AccordionContent>
            Yes, we take data security seriously. All uploaded images and product data are encrypted and stored
            securely. We do not share your data with third parties, and you retain full ownership of all your
            content.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Can I customize the AI to match my brand voice?</AccordionTrigger>
          <AccordionContent>
            Yes, Enterprise plan users can train the AI with examples of their preferred writing style and brand
            voice. All users can edit generated descriptions to match their brand guidelines.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger>How do I get started?</AccordionTrigger>
          <AccordionContent>
            Simply sign up for a free account, upload your first product image or barcode, and let our AI do the
            rest. You can be up and running in less than 5 minutes with no technical setup required.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
  )
}
function QuestionMarkIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    )
  }