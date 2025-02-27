"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Edit, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function UnorganizedProductPage() {
  const [step, setStep] = useState<"upload" | "processing" | "results">("upload")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedResultImage, setSelectedResultImage] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Simulated AI-generated images
  const resultImages = [
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        // Simulate processing
        setStep("processing")
        setTimeout(() => {
          setStep("results")
          setTitle("Premium Wireless Headphones")
          setDescription(
            "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Compatible with all Bluetooth devices.",
          )
        }, 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProduct = () => {
    if (!selectedResultImage) {
      toast({
        title: "Please select an image",
        description: "You must select one of the generated images before saving.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Product saved successfully",
      description: "The product has been added to your catalog.",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        
      </div>

      {step === "upload" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Upload Product Image</CardTitle>
            <CardDescription>
              Upload a clear image of your product. Our AI will detect the product and generate details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">Drag and drop your image here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 10MB)</p>
                <Input type="file" className="hidden" accept="image/*" id="product-image" onChange={handleFileChange} />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById("product-image")?.click()}
                >
                  Select Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Processing Your Product</CardTitle>
            <CardDescription>Our AI is analyzing your product image and generating details...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              This may take a few moments. We're detecting your product and generating high-quality images, title, and
              description.
            </p>
          </CardContent>
        </Card>
      )}

      {step === "results" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>Select the best image for your product.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {resultImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer overflow-hidden rounded-md border-2 ${selectedResultImage === index ? "border-primary" : "border-transparent"}`}
                    onClick={() => setSelectedResultImage(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Generated product image ${index + 1}`}
                      width={300}
                      height={300}
                      className="aspect-square object-cover"
                    />
                    {selectedResultImage === index && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Review and edit the AI-generated product details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Product Title</Label>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(!isEditingTitle)}>
                    {isEditingTitle ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
                {isEditingTitle ? (
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                ) : (
                  <p className="rounded-md border p-2">{title}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Product Description</Label>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(!isEditingDescription)}>
                    {isEditingDescription ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
                {isEditingDescription ? (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="rounded-md border p-2 text-sm">{description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (Optional)</Label>
                <Input id="price" placeholder="$0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Start Over
              </Button>
              <Button onClick={handleSaveProduct}>Save to Catalog</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

