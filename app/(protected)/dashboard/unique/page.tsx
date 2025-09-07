"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit,
  Loader2,
  Upload,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSaveProduct } from "@/hooks/use-save-product";

interface DetectionResult {
  productName: string;
  description: string;
  category: string;
  enhancementPrompt: string;
  confidence: number;
}

type WorkflowStep =
  | "upload"
  | "detecting"
  | "editing"
  | "enhancing"
  | "completed"
  | "error";

export default function ProductEditPage() {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawImageBase64, setRawImageBase64] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64Full = event.target?.result as string;
      const base64 = base64Full?.split(",")[1];

      if (!base64) {
        setError("Failed to process image");
        return;
      }

      setSelectedImage(URL.createObjectURL(file));
      setRawImageBase64(base64);
      setStep("detecting");

      try {
        const detectResponse = await fetch("/api/image/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: base64,
          }),
        });

        if (!detectResponse.ok) {
          throw new Error("Product detection failed");
        }

        const detection: DetectionResult = await detectResponse.json();

        setDetectionResult(detection);
        setProductName(detection.productName);
        setDescription(detection.description);
        setCategory(detection.category);
        setStep("editing");
        setStep("enhancing");
        enhanceImageInBackground(base64, detection.enhancementPrompt);
      } catch (error) {
        console.error("Detection error:", error);
        setError("Failed to analyze the product. Please try again.");
        setStep("error");
      }
    };

    reader.readAsDataURL(file);
  };

  const enhanceImageInBackground = async (
    imageBase64: string,
    enhancementPrompt: string,
  ) => {
    try {
      const enhanceResponse = await fetch("/api/image/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          enhancementPrompt,
        }),
      });

      if (!enhanceResponse.ok) {
        throw new Error("Image enhancement failed");
      }

      const enhanceData = await enhanceResponse.json();
      setEnhancedImage(
        `data:image/png;base64,${enhanceData.editedImageBase64}`,
      );
      setStep("completed");
    } catch (error) {
      console.error("Enhancement error:", error);
      setError("Failed to enhance the image, but product details are ready.");
    }
  };

  const { state: saveState, saveProduct, reset: resetSave } = useSaveProduct();

  const handleSaveProduct = async () => {
    if (!detectionResult || !enhancedImage) {
      toast({
        title: "Cannot save product",
        description: "Product analysis or image enhancement is not complete.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: productName,
      description: description,
      category: category,
      price: price ? parseFloat(price) : undefined,
    };

    const base64Data = enhancedImage.replace(/^data:image\/[a-z]+;base64,/, "");
    const result = await saveProduct(productData, base64Data);

    if (result.success) {
      toast({
        title: "Product saved successfully!",
        description: "The product has been added to your catalog.",
      });
    } else {
      toast({
        title: "Failed to save product",
        description: saveState.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setStep("upload");
    setSelectedImage(null);
    setRawImageBase64(null);
    setEnhancedImage(null);
    setProductName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setDetectionResult(null);
    setIsEditingName(false);
    setIsEditingDescription(false);
    setError(null);
  };

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
              Upload a clear image of your product. Our AI will analyze it and
              create an enhanced e-commerce listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">
                  Drag and drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  id="product-image"
                  onChange={handleFileChange}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    document.getElementById("product-image")?.click()
                  }
                >
                  Select Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "detecting" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Analyzing Your Product</CardTitle>
            <CardDescription>
              Our AI is identifying your product and generating details...
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

      {(step === "enhancing" || step === "completed") && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                {step === "enhancing"
                  ? "Enhancing your product image..."
                  : "Your enhanced product image"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enhancedImage ? (
                <Image
                  src={enhancedImage}
                  alt="Enhanced Product Image"
                  width={400}
                  height={400}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="flex h-96 w-full flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25">
                  <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Creating enhanced image...
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-end justify-end gap-3">
              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
              {step === "completed" && (
                <Button
                  onClick={handleSaveProduct}
                  disabled={saveState.isUploading || saveState.isSaving}
                >
                  {saveState.isUploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {saveState.isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {saveState.isUploading
                    ? `Uploading... ${Math.round(saveState.uploadProgress)}%`
                    : saveState.isSaving
                      ? "Saving..."
                      : "Save to Catalog"}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Review and edit the AI-generated product information.
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

              {/* Category (Read-only for now) */}
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

              {/* Detection Confidence */}
              {detectionResult && (
                <div className="space-y-2">
                  <Label>AI Confidence</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-muted rounded">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{
                          width: `${detectionResult.confidence * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(detectionResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Alert (if enhancement fails but detection succeeded) */}
      {error && step !== "error" && (
        <Alert className="mx-auto max-w-2xl mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Save Error Alert */}
      {saveState.error && (
        <Alert className="mx-auto max-w-2xl mt-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveState.error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {saveState.success && (
        <Alert className="mx-auto max-w-2xl mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Product saved successfully to your catalog!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
