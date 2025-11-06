// /api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// Validation schema for creating products
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().min(1, "Description is required").max(2000),
  category: z.string().min(1, "Category is required").max(100),
  price: z.number().positive().optional(),
  ImageUrl: z.string().url("Valid image URL is required"),
});

// POST - Create a new product
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        ImageUrl: validatedData.ImageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price ? Number(product.price) : undefined,
          ImageUrl: product.ImageUrl,
          createdAt: product.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Product creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 },
    );
  }
}

// GET - List all products with pagination
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Only fetch products that belong to the authenticated user
    const where = { userId: session.user.id };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          ImageUrl: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      price: product.price ? Number(product.price) : undefined,
    }));

    const response = NextResponse.json(
      {
        success: true,
        products: serializedProducts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 },
    );

    // Add cache control headers
    // Cache for 5 minutes, but allow stale content while revalidating
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, stale-while-revalidate=60",
    );

    return response;
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
