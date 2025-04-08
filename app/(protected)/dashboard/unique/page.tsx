"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Edit, Loader2, Upload } from "lucide-react";

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

export default function ProductEditPage() {
  const [step, setStep] = useState<"upload" | "processing" | "results">(
    "upload"
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Full = event.target?.result as string;
      console.log("Full base64 result:", base64Full);

      const base64 = base64Full?.split(",")[1];
      if (!base64) {
        console.error("Base64 data missing!");
        return;
      }

      setSelectedImage(URL.createObjectURL(file));
      setStep("processing");

      try {
        const res = await fetch("/api/image/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: base64,
          }),
        });

        if (!res.ok) throw new Error("Image processing failed");

        const data = await res.json();
        setResultImage(`data:image/png;base64,${data.editedImageBase64}`);
        setTitle("Title of the Product");
        setDescription("Description of the Product");
        setStep("results");
      } catch (error) {
        console.error(error);
        alert("Something went wrong while processing the image.");
        setStep("upload");
      }
    };
    reader.readAsDataURL(file);
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
              Upload a clear image of your product. Our AI will generate
              enhanced visuals and descriptions.
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

      {step === "processing" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Processing Your Image</CardTitle>
            <CardDescription>
              Hold tight! Our AI is enhancing your image...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              This might take a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {step === "results" && resultImage && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Edited Image</CardTitle>
              <CardDescription>
                Here’s your enhanced product image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={resultImage}
                alt="Edited Product Image"
                width={400}
                height={400}
                className="rounded-md object-cover"
              />
            </CardContent>
            <CardFooter className="flex items-end justify-end gap-3">
              <Button variant="outline">Retry</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Review and edit product information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Product Title</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                  >
                    {isEditingTitle ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isEditingTitle ? (
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <p className="rounded-md border p-2">{title}</p>
                )}
              </div>

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
