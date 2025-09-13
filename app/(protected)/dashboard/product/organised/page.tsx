"use client";
import { useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, AlertCircle, Check, Edit } from "lucide-react";
import { UploadSection } from "@/components/product/UploadSection";

type WorkflowStep = "upload" | "scraping" | "completed" | "error";

export default function ProductPage() {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [barcodeNumber, setBarcodeNumber] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [productImage, setProductImage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleBarcodeDetected = async (barcode: string) => {
    setBarcodeNumber(barcode);
    setStep("scraping");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodeNumber: barcode }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      if (data.product) {
        setProductName(data.product.name || "");
        setDescription(data.product.description || "");
        setCategory(data.product.category || "");
        setProductImage(data.product.imageUrl || "");
        setStep("completed");
      } else {
        setError("No product details found.");
        setStep("error");
      }
    } catch (err) {
      console.error("Error scraping data", err);
      setError("Failed to analyze the product. Please try again.");
      setStep("error");
    }
  };

  const handleSaveProduct = async () => {
    if (!productImage) {
      toast({
        title: "Cannot save product",
        description: "Product analysis or image enhancement is not complete.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          description,
          category,
          price: price ? parseFloat(price) : undefined,
          ImageUrl: productImage,
        }),
      });
      toast({
        title: "Product saved successfully!",
        description: "The product has been added to your catalog.",
      });
    } catch {
      toast({
        title: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setStep("upload");
    setBarcodeNumber("");
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Back Button */}
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <UploadSection
          onUpload={({ file }) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
              const { BrowserBarcodeReader } = await import("@zxing/library");
              const codeReader = new BrowserBarcodeReader();
              try {
                const result = await codeReader.decodeFromImage(img);
                const detectedBarcode = result.getText();
                console.log("Barcode:", detectedBarcode);

                // ✅ Call your handler
                handleBarcodeDetected(detectedBarcode);
              } catch {
                console.error("No barcode found");
                setError("No valid barcode found. Please try again.");
                setStep("error");
              }
            };
          }}
        />
      )}

      {/* Scraping Step */}
      {step === "scraping" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Getting Your Product Details</CardTitle>
            <CardDescription>
              Our Scraping Engine is identifying your product and generating
              details...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              This usually takes just a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Step */}
      {step === "error" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We encountered an issue processing your image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartOver} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Completed Step */}
      {step === "completed" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>Your product image</CardDescription>
            </CardHeader>
            <CardContent>
              <NextImage
                src={productImage}
                alt="Product Image"
                width={400}
                height={400}
                className="rounded-md object-cover"
              />
            </CardContent>
            <CardFooter className="flex items-end justify-end gap-3">
              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
              <Button onClick={handleSaveProduct}>Save</Button>
            </CardFooter>
          </Card>

          {/* Product Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Review and edit the product information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="productName">Product Name</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(!isEditingName)}
                  >
                    {isEditingName ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isEditingName ? (
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                ) : (
                  <p className="rounded-md border p-2">{productName}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIsEditingDescription(!isEditingDescription)
                    }
                  >
                    {isEditingDescription ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
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

              {/* Category (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <p className="rounded-md border p-2 text-sm bg-muted">
                  {category}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (Optional)</Label>
                <Input
                  id="price"
                  placeholder="$0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
