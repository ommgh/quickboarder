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
    [pagination.limit],
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

    const exportFileDefaultName = `quickboarder-catalog-${new Date().toISOString().split("T")[0]}.json`;
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Product Catalog</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} of {pagination.total} product
              {pagination.total !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || filteredProducts.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
          <CardDescription>
            Search through your product catalog by name, description, or
            category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, description, or category..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} result
                {filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={product.ImageUrl || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={225}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1 text-lg">
                      {product.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2 text-xs">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatPrice(product.price)}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {product.category.charAt(0).toUpperCase() +
                        product.category.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "No products match your search"
                  : "No products found"}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              ) : (
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/dashboard">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
