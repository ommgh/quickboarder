// /api/models/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// GET - Get a single model
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

    const model = await prisma.models.findUnique({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns this model
      },
    });

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        model: model,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Model fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch model" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a model
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

    // First check if model exists and belongs to user
    const model = await prisma.models.findUnique({
      where: {
        id: id,
      },
    });

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 },
      );
    }

    if (model.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Delete the model
    await prisma.models.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Model deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Model deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete model" },
      { status: 500 },
    );
  }
}

// PATCH - Update a model
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

    // First check if model exists and belongs to user
    const model = await prisma.models.findUnique({
      where: {
        id: id,
      },
    });

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 },
      );
    }

    if (model.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Update the model
    const updatedModel = await prisma.models.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        ImageUrl: body.ImageUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        model: updatedModel,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Model update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update model" },
      { status: 500 },
    );
  }
}
