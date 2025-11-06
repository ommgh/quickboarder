"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Edit,
  Plus,
  Search,
  Trash,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ProductDeleteButton } from "@/components/product/ProductDelete";

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

const CACHE_KEY = "products_cache";
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  products: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: number;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

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

  const invalidateCache = () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Error invalidating cache:", error);
    }
  };

  const fetchProducts = useCallback(
    async (offset = 0, useCache = true) => {
      try {
        setLoading(true);
        setError(null);

        if (useCache && offset === 0) {
          const cachedData = getCachedData();
          if (cachedData) {
            setProducts(cachedData.products);
            setPagination(cachedData.pagination);
            setLoading(false);
            return;
          }
        }

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

        const data: ProductsResponse = await response.json();

        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);

          if (offset === 0) {
            setCachedData({
              products: data.products,
              pagination: data.pagination,
              timestamp: Date.now(),
            });
          }
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startItem = pagination.offset + 1;
  const endItem = Math.min(
    pagination.offset + pagination.limit,
    pagination.total,
  );

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setCurrentPage(page);
    fetchProducts(newOffset, false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== id));
      invalidateCache();

      setTimeout(() => {
        fetchProducts(pagination.offset, false);
      }, 500);
    } catch (err) {
      throw err;
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
    fetchProducts(0, true);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const cachedData = getCachedData();
      if (!cachedData) {
        fetchProducts(pagination.offset, false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pagination.offset, fetchProducts]);

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
        <div className="flex h-[100%] items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button
            onClick={() => fetchProducts(pagination.offset, false)}
            variant="outline"
          >
            Try Again
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden py-0 flex flex-col"
                >
                  <div className="relative overflow-hidden h-[225px]">
                    <Image
                      src={product.ImageUrl || "/placeholder.svg"}
                      alt={product.name}
                      width={400}
                      height={225}
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="flex flex-col gap-2 mt-2 text-xs">
                      <span className="line-clamp-2">
                        {product.description}
                      </span>
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
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/product/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ProductDeleteButton
                          productId={product.id}
                          onDelete={handleDeleteProduct}
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
                </p>
              </div>
            )}
          </div>

          {!searchQuery && pagination.total > pagination.limit && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {pagination.total} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
