import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
const prisma = new PrismaClient();

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().min(1, "Description is required").max(2000),
  category: z.string().min(1, "Category is required").max(100),
  price: z.number().positive().optional(),
  ImageUrl: z.string().url("Valid image URL is required"),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const body = await req.json();

    const validatedData = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        ImageUrl: validatedData.ImageUrl,
        userId: session?.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          id: product.id,
          name: product.name,
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
          details: error.errors,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category");

    const where = category ? { category } : {};

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

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}
