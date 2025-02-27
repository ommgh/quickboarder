import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-16 lg:gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">QuickBoarder</span>
        </div>
        <nav className="ml-auto hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      </header>
  )
}
