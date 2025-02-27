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

export default function OrganizedProductPage() {
  const [step, setStep] = useState<"upload" | "processing" | "results">("upload")
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null)
  const [barcodeNumber, setBarcodeNumber] = useState<string>("")
  const [selectedResultImage, setSelectedResultImage] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Simulated web-scraped images
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
        setBarcodeImage(event.target?.result as string)
        // Simulate processing
        setStep("processing")
        setTimeout(() => {
          setBarcodeNumber("8901234567890")
          setStep("results")
          setTitle("Smart Fitness Tracker Watch")
          setDescription(
            "Track your fitness goals with this advanced smart watch. Features include heart rate monitoring, step counting, sleep tracking, and smartphone notifications. Water-resistant up to 50m.",
          )
        }, 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleManualBarcode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeNumber || barcodeNumber.length < 8) {
      toast({
        title: "Invalid barcode",
        description: "Please enter a valid barcode number",
        variant: "destructive",
      })
      return
    }

    setStep("processing")
    setTimeout(() => {
      setStep("results")
      setTitle("Smart Fitness Tracker Watch")
      setDescription(
        "Track your fitness goals with this advanced smart watch. Features include heart rate monitoring, step counting, sleep tracking, and smartphone notifications. Water-resistant up to 50m.",
      )
    }, 3000)
  }

  const handleSaveProduct = () => {
    if (!selectedResultImage) {
      toast({
        title: "Please select an image",
        description: "You must select one of the scraped images before saving.",
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
            <CardTitle>Upload Barcode</CardTitle>
            <CardDescription>
              Upload a barcode image or enter the barcode number manually. We'll fetch product details automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">Drag and drop your barcode image here or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    id="barcode-image"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => document.getElementById("barcode-image")?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <form onSubmit={handleManualBarcode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode Number</Label>
                  <Input
                    id="barcode"
                    placeholder="Enter barcode number"
                    value={barcodeNumber}
                    onChange={(e) => setBarcodeNumber(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Process Barcode
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Processing Your Barcode</CardTitle>
            <CardDescription>We're fetching product details from online sources...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              This may take a few moments. We're searching for your product using barcode {barcodeNumber || "detection"}{" "}
              and gathering images, title, and description.
            </p>
          </CardContent>
        </Card>
      )}

      {step === "results" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scraped Images</CardTitle>
              <CardDescription>
                Select the best image for your product. These images were found online using barcode {barcodeNumber}.
              </CardDescription>
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
                      alt={`Scraped product image ${index + 1}`}
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
              <CardDescription>Review and edit the scraped product details.</CardDescription>
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

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" value={barcodeNumber} disabled className="bg-muted" />
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

