"use client";
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
import { useSaveProduct } from "@/hooks/use-save-product";
import { generateVirtualTryOnImage } from "@/services/geminiService";
import { Loader2, Upload, ArrowLeft, Check, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface Model {
  id: string;
  name: string;
  ImageUrl: string;
}

interface ModelResponse {
  success: boolean;
  models: Model[];
  error: string;
}

type WorkflowStep =
  | "model-selection"
  | "product-upload"
  | "generating"
  | "result";

export default function Page() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: saveState, saveProduct, reset: resetSave } = useSaveProduct();
  // Workflow state
  const [currentStep, setCurrentStep] =
    useState<WorkflowStep>("model-selection");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedModelImageUrl, setSelectedModelImageUrl] = useState<
    string | null
  >(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(
    null,
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState("New Product");
  const [description, setDescription] = useState("Description");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Apparel");

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models");
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setSelectedModelImageUrl(model.ImageUrl);
    setCurrentStep("product-upload");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!selectedModel || !productImage) return;

    setIsGenerating(true);
    setCurrentStep("generating");

    try {
      const response = await generateVirtualTryOnImage(
        selectedModel.ImageUrl,
        productImage,
      );
      setGeneratedImage(response);
      setCurrentStep("result");
    } catch (error) {
      setError("Failed to generate image");
      setCurrentStep("product-upload");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!generatedImage) {
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

    const base64Data = generatedImage.replace(
      /^data:image\/[a-z]+;base64,/,
      "",
    );
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
    setSelectedModel(null);
    setProductImage(null);
    setProductImagePreview(null);
    setGeneratedImage(null);
    setCurrentStep("model-selection");
    setError(null);
  };

  const handleBackToUpload = () => {
    setCurrentStep("product-upload");
    setGeneratedImage(null);
    setError(null);
  };

  const handleBackToModels = () => {
    setSelectedModel(null);
    setProductImage(null);
    setProductImagePreview(null);
    setCurrentStep("model-selection");
    setError(null);
  };

  // Render based on current step
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading models...</span>
      </div>
    );
  }

  if (error && currentStep === "model-selection") {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={() => fetchModels()} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span
            className={
              currentStep === "model-selection"
                ? "text-primary font-medium"
                : ""
            }
          >
            1. Select Model
          </span>
          <span>→</span>
          <span
            className={
              currentStep === "product-upload" ? "text-primary font-medium" : ""
            }
          >
            2. Upload Product
          </span>
          <span>→</span>
          <span
            className={
              currentStep === "generating" || currentStep === "result"
                ? "text-primary font-medium"
                : ""
            }
          >
            3. Generate & Save
          </span>
        </div>
      </div>

      {/* Model Selection Step */}
      {currentStep === "model-selection" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Select a Model</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {models.length > 0 ? (
              models.map((model) => (
                <Card
                  key={model.id}
                  className="flex flex-col overflow-hidden rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleModelSelect(model)}
                >
                  {/* Image container */}
                  <div className="p-4 pb-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-md">
                      <Image
                        src={model.ImageUrl || "/placeholder.svg"}
                        alt={model.name}
                        height={400}
                        width={400}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="px-4 py-6 flex items-center justify-center">
                    <span className="font-semibold text-lg">{model.name}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-64">
                <Link href="/dashboard/models" className="border-dotted">
                  No models found. Create a new model.
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Upload Step */}
      {currentStep === "product-upload" && selectedModel && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToModels} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:grid-cols-3">
            {/* Selected Model */}
            <div>
              <Card className="flex flex-col overflow-hidden rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                {/* Image container */}
                <div className="p-4 pb-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={selectedModel.ImageUrl || "/placeholder.svg"}
                      alt={selectedModel.name}
                      height={400}
                      width={500}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="px-4 py-6 flex items-center justify-center">
                  <span className="font-semibold text-lg">
                    {selectedModel.name}
                  </span>
                </div>
              </Card>
            </div>

            {/* Product Upload */}
            <div>
              {!productImagePreview ? (
                <Card className="p-8 border-dashed border-2 border-muted-foreground/25">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg mb-2">Upload apparel image</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PNG, JPG up to 10MB
                    </p>
                    <Button onClick={handleFileUpload}>Choose File</Button>
                  </div>
                </Card>
              ) : (
                <div>
                  <Card className="flex flex-col overflow-hidden rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="p-4 pb-0">
                      <div className="relative aspect-square w-full overflow-hidden rounded-md">
                        <Image
                          src={productImagePreview}
                          alt="Product preview"
                          width={400}
                          height={600}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </Card>
                  <div className=" mt-5 flex gap-2">
                    <Button onClick={handleFileUpload} variant="outline">
                      Change Image
                    </Button>
                    <Button onClick={handleGenerate} className="flex-1">
                      Generate Try-On
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 border border-destructive/20 rounded-lg bg-destructive/10">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Generating Step */}
      {currentStep === "generating" && (
        <div className="text-center py-16">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Generating Try-On Image</h2>
          <p className="text-muted-foreground">
            Please wait while we create your virtual try-on...
          </p>
        </div>
      )}

      {/* Result Step */}
      {currentStep === "result" && generatedImage && selectedModel && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToUpload} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
            <h1 className="text-3xl font-bold">Try-On Result</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Image Section */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated Product Image"
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
                {currentStep === "result" && (
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
                    <p className="rounded-md border p-2 text-sm">
                      {description}
                    </p>
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
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-4 p-4 border border-destructive/20 rounded-lg bg-destructive/10 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
