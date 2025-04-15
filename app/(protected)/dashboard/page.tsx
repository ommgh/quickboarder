import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Box,
  Image,
  Package,
  Sparkles,
  Upload,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                +22% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organized Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +10% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unorganized Products
              </CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">53</div>
              <p className="text-xs text-muted-foreground">
                +49% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Products
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">
                +4% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload a product image or barcode to get started with
                QuickBoarder AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Card>
                <CardHeader className="">
                  <CardTitle className="text-lg">Unique Products</CardTitle>
                  <CardDescription>
                    Upload a image of your crafted products and get it
                    e-Commerce ready.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/unique">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Unorganized Products
                    </CardTitle>
                    <CardDescription>
                      Upload an image of your product and let AI generate the
                      details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/unorganized">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Product Image
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Organized Products
                    </CardTitle>
                    <CardDescription>
                      Upload a barcode image and we'll fetch product details
                      automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/organized">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Barcode
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent product processing activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Wireless Headphones
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Processed as unorganized product
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">2m ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Smart Watch
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Processed as organized product
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">1h ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Bluetooth Speaker
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Processed as unorganized product
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">3h ago</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/activity">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
