"use client";
import { useEffect, useState } from "react";
import { Model } from "@/types";
import { Loader2, Plus, PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading models...</span>
      </div>
    );
  }
  if (error) {
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
      <h1 className="text-3xl font-bold mb-6">Models</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {models.map((model) => (
          <div key={model.id}>
            <Card className="flex flex-col overflow-hidden rounded-xl hover:shadow-lg transition-shadow h-full">
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
          </div>
        ))}
        <Link href="/dashboard/models/new">
          <Card className="flex flex-col items-center justify-center rounded-xl cursor-pointer hover:shadow-lg transition-shadow h-full aspect-square sm:aspect-auto">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <PlusIcon className="h-12 w-12 text-muted-foreground" />
              <span className="mt-2 font-semibold text-lg">
                Create New Model
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
