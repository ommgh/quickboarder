"use client";

import { useEffect, useState, useCallback } from "react";
import { Model } from "@/types";
import { Loader2, PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const CACHE_KEY = "models_cache";
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  models: Model[];
  timestamp: number;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): CachedData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CachedData = JSON.parse(cached);
      const now = Date.now();

      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }

      sessionStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const setCachedData = (data: CachedData) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  const fetchModels = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      if (useCache) {
        const cachedData = getCachedData();
        if (cachedData) {
          setModels(cachedData.models);
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/models");
      const data = await response.json();

      if (data.success) {
        setModels(data.models);

        setCachedData({
          models: data.models,
          timestamp: Date.now(),
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to fetch models");
      console.error("Fetch models error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels(true);
  }, [fetchModels]);

  useEffect(() => {
    const handleFocus = () => {
      const cachedData = getCachedData();
      if (!cachedData) {
        fetchModels(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchModels]);

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
          <Button onClick={() => fetchModels(false)} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Models</h1>
      </div>

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
