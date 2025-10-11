"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Loader2,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  ImageUrl: string;
  createdAt: string;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  // Fetch products from API
  const fetchProducts = useCallback(
    async (offset = 0) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log("API Response:", responseText);

        let data: ProductsResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error("Response text:", responseText);
          throw new Error("Invalid JSON response from server");
        }

        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || "Failed to fetch products");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch products";
        console.error("Fetch Products Error:", err);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product.id !== id));

      toast({
        title: "Product deleted",
        description: "The product has been removed from your catalog.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const exportData = {
      products: filteredProducts,
      exportedAt: new Date().toISOString(),
      totalProducts: pagination.total,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `quickboarder-catalog-${
      new Date().toISOString().split("T")[0]
    }.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Catalog exported",
      description: "Your product catalog has been exported as JSON.",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, description, or category..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || filteredProducts.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
          <Button asChild>
            <Link href="/dashboard/product">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-screen items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={() => fetchProducts()} variant="outline">
            Try Again
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden py-0">
                <div className="overflow-hidden">
                  <Image
                    src={product.ImageUrl || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={225}
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-2 mt-2 text-xs ">
                    <span className="line-clamp-2">{product.description}</span>
                    <span className="w-fit bg-muted px-2 py-1 text-xs">
                      {product.category.charAt(0).toUpperCase() +
                        product.category.slice(1)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <Trash
                        className="h-4 w-4 text-destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center border border-dashed p-8 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "No products match your search"
                  : "No products found"}
              </p>{" "}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
