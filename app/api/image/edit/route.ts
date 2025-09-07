//file: app/api/image/edit/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_GENERATION_API_KEY!;

// Fallback system prompt if no specific enhancement prompt is provided
const DEFAULT_SYSTEM_PROMPT = `
You are an AI model that takes raw product images and enhances them for e-commerce listings. Your goal is to identify the core product in the image (e.g., painting, furniture, decor, apparel, etc.) and transform it into a high-quality, visually appealing, and professional listing-ready image.

For each image:
1. Detect and isolate the main product.
2. Enhance its presentation:
   - If it's artwork (painting, print, etc.): add a realistic frame, mount it on a styled wall (e.g., bedroom, living room, gallery).
   - If it's furniture: place it in a minimalist, well-lit room context.
   - If it's a small item (vase, lamp, decor): place on a clean surface with soft shadows and ambient light.
   - If it's apparel: place on a mannequin or human model in a clean, fashion-forward setting.
3. Use neutral, clean, modern backgrounds that fit the context and make the product the focus.
4. Preserve accurate product colors, proportions, and textures.
5. Avoid adding text, logos, or unnatural shadows unless explicitly instructed.

Output a polished, high-resolution image suitable for e-commerce platforms like Amazon, Etsy, or Shopify.
`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { imageBase64, enhancementPrompt } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Use the provided enhancement prompt or fall back to the default system prompt
    const systemPrompt = enhancementPrompt || DEFAULT_SYSTEM_PROMPT;

    const contents = [
      { text: systemPrompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    const candidates = result.candidates ?? [];
    const parts = candidates[0]?.content?.parts ?? [];
    const imagePart = parts.find((part) => part.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    const editedImageBase64 = imagePart.inlineData.data;
    return NextResponse.json({ editedImageBase64 }, { status: 200 });
  } catch (error) {
    console.error("Gemini image edit error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
