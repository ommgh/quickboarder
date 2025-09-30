"use client";

import { useState } from "react";
import { User, Building2, Upload, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BrandCreationPage() {
  const [choice, setChoice] = useState<"person" | "business" | null>(null);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Create Your Brand</h1>
        <p className="text-muted-foreground">
          Select how you want to create your brand and provide a few details to
          generate your assets.
        </p>

        {/* Step 1: Choice */}
        {!choice && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              onClick={() => setChoice("person")}
              className="cursor-pointer hover:border-primary transition"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" /> Person
                </CardTitle>
                <CardDescription>
                  Build a personal brand around yourself
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              onClick={() => setChoice("business")}
              className="cursor-pointer hover:border-primary transition"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-primary" /> Business
                </CardTitle>
                <CardDescription>
                  Build a professional brand for your business
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Step 2: Forms */}
        {choice === "person" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Brand</CardTitle>
              <CardDescription>
                Tell us a bit about yourself and your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Photo</Label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <Label>What do you do / sell?</Label>
                <Input placeholder="e.g., Handmade candles, Graphic design" />
              </div>
              <div>
                <Label>Product Photo</Label>
                <Input type="file" className="mt-1" />
              </div>
              <Button className="w-full mt-4">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Brand Assets
              </Button>
            </CardContent>
          </Card>
        )}

        {choice === "business" && (
          <Card>
            <CardHeader>
              <CardTitle>Business Brand</CardTitle>
              <CardDescription>
                Provide details about your company and product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input placeholder="e.g., QuickCraft Pvt Ltd" />
              </div>
              <div>
                <Label>Industry</Label>
                <Input placeholder="e.g., Fashion, Tech, Food" />
              </div>
              <div>
                <Label>Upload Logo / Reference Image</Label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <Label>Product Photo</Label>
                <Input type="file" className="mt-1" />
              </div>
              <Button className="w-full mt-4">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Brand Assets
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reset */}
        {choice && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setChoice(null)}
          >
            Start Over
          </Button>
        )}
      </div>
    </div>
  );
}
