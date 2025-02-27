"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Download, Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Sample product data
const sampleProducts = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality.",
    price: "$129.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687085/quickboarder/replicate-prediction-850hvt6hr1rmc0cn940r8s4yxc_attd0p.png?height=300&width=300",
    type: "unorganized",
  },
  {
    id: 2,
    title: "Smart Fitness Tracker Watch",
    description:
      "Track your fitness goals with this advanced smart watch. Features include heart rate monitoring, step counting, sleep tracking.",
    price: "$89.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687066/quickboarder/replicate-prediction-pybshnr1bnrm80cn942tbfa6e4_vzbcjb.png?height=300&width=300",
    type: "organized",
    barcode: "8901234567890",
  },
  {
    id: 3,
    title: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 20-hour battery life and deep bass sound.",
    price: "$59.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687063/quickboarder/replicate-prediction-0qnmaecnvxrma0cn942swkm0qw_snw2et.png?height=300&width=300",
    type: "unorganized",
  },
  {
    id: 4,
    title: "Ultra HD Action Camera",
    description: "Capture your adventures in stunning 4K resolution with this waterproof action camera.",
    price: "$199.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687061/quickboarder/replicate-prediction-8hw5qqq2b5rma0cn942vsks1jw_c1lhc2.png?height=300&width=300",
    type: "organized",
    barcode: "7654321098765",
  },
  {
    id: 5,
    title: "Ergonomic Gaming Mouse",
    description: "Precision gaming mouse with adjustable DPI and customizable RGB lighting.",
    price: "$49.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687059/quickboarder/replicate-prediction-6bqv601475rmc0cn943b9ex2j0_bgptou.png?height=300&width=300",
    type: "unorganized",
  },
  {
    id: 6,
    title: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with customizable backlighting and programmable keys.",
    price: "$79.99",
    image: "https://res.cloudinary.com/dcwsgwsfw/image/upload/v1740687058/quickboarder/replicate-prediction-k7x5mhkt3nrme0cn943a4xghar_ihjtuo.png?height=300&width=300",
    type: "organized",
    barcode: "1122334455667",
  },
]

export default function CatalogPage() {
  const [products, setProducts] = useState(sampleProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || product.type === filterType

    return matchesSearch && matchesType
  })

  const handleExport = () => {
    // Create a JSON file with the product data
    const dataStr = JSON.stringify(products, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Create a link element and trigger download
    const exportFileDefaultName = "quickboarder-catalog.json"
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Catalog exported",
      description: "Your product catalog has been exported as JSON.",
    })
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id))

    toast({
      title: "Product deleted",
      description: "The product has been removed from your catalog.",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleExport}>
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
          <CardTitle>Filter Products</CardTitle>
          <CardDescription>Search and filter your product catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="organized">Organized Products</SelectItem>
                <SelectItem value="unorganized">Unorganized Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={400}
                  height={225}
                  className="h-full w-full object-cover transition-all hover:scale-105"
                />
              </div>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">{product.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2 mt-2 text-xs">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{product.price}</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {product.type === "organized" ? "Organized" : "Unorganized"}
                  </span>
                </div>
                {product.type === "organized" && (
                  <div className="mt-2 text-xs text-muted-foreground">Barcode: {product.barcode}</div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-sm text-muted-foreground">No products found</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/dashboard">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

