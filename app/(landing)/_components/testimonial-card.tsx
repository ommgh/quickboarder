"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"

import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  avatar: string
}

export function TestimonialCard({ quote, author, role, company, avatar }: TestimonialCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="mb-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg key={i} className="inline-block h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
          <p className="mb-4 text-lg italic">"{quote}"</p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-4">
            <Image src={avatar || "/placeholder.svg"} alt={author} width={40} height={40} className="rounded-full" />
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-sm text-muted-foreground">
                {role}, {company}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

