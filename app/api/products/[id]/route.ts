// /api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// GET - Get a single product
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Await params before accessing properties
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns this product
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          price: product.price ? Number(product.price) : undefined,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Await params before accessing properties
    const { id } = await context.params;

    // First check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (product.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}

// PATCH - Update a product
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Await params before accessing properties
    const { id } = await context.params;

    // First check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (product.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        price: body.price,
        ImageUrl: body.ImageUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          ...updatedProduct,
          price: updatedProduct.price
            ? Number(updatedProduct.price)
            : undefined,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}
