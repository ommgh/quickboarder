"use client";

import { Package, ShoppingCart, BarChart3, Layers } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function StoreHomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Store Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your products, catalogs, sales and models
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5 text-primary" /> Products
              </CardTitle>
              <CardDescription>Total items listed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">128</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Layers className="mr-2 h-5 w-5 text-primary" /> Catalogs
              </CardTitle>
              <CardDescription>Active product catalogs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5 text-primary" /> Sales
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹3,240</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Models
              </CardTitle>
              <CardDescription>AI models generated</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">14</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Wireless Headphones",
                price: "₹59.99",
                status: "In Stock",
              },
              { name: "Smart Watch", price: "₹120.00", status: "Low Stock" },
              { name: "Gaming Mouse", price: "₹35.00", status: "In Stock" },
            ].map((product, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
