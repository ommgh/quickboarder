// /api/product/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// Validation schema for updating products
const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255).optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000)
    .optional(),
  category: z.string().min(1, "Category is required").max(100).optional(),
  price: z.number().positive().optional(),
  ImageUrl: z.string().url("Valid image URL is required").optional(),
});

// GET - Get a single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        ImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Convert Decimal to number for JSON serialization
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : undefined,
    };

    return NextResponse.json(
      {
        success: true,
        product: serializedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}

// PUT/PATCH - Update a product by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        ImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedProduct = {
      ...updatedProduct,
      price: updatedProduct.price ? Number(updatedProduct.price) : undefined,
    };

    return NextResponse.json(
      {
        success: true,
        product: serializedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete a product by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
        deletedId: productId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
