import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const prisma = new PrismaClient();

const createModelSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  ImageUrl: z.string().url("Valid image URL is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createModelSchema.parse(body);

    const model = await prisma.models.create({
      data: {
        name: validatedData.name,
        ImageUrl: validatedData.ImageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(model);
  } catch (error) {
    console.error("Model creation error:", error);
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
        error: "Failed to create model",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await prisma.models.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error("Models retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve models",
      },
      { status: 500 },
    );
  }
}
