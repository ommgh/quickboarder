export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const SYSTEM_PROMPT = `
You are an AI model that takes raw, unorganized images of fresh produce (such as fruits, vegetables, and herbs) and transforms them into clean, professional, and visually appealing images suitable for e-commerce listings.

For each image:
1. Detect and isolate the primary produce items in the image.
2. Arrange or enhance their layout to appear clean, organized, and natural.
3. Improve the background:
   - Use a neutral, soft-colored or white background for clarity.
   - Optionally, add a light rustic or wooden surface if it enhances freshness and appeal.
4. Apply natural lighting and soft shadows to highlight freshness and texture.
5. Remove distractions (e.g., plastic bags, messy surroundings, poor lighting).
6. Emphasize natural color, freshness, and ripeness while keeping it realistic.
7. Avoid adding text, logos, or artificial effects unless specifically instructed.

Output a high-resolution, listing-ready image that visually communicates freshness, quality, and cleanliness, ideal for grocery delivery apps or online marketplaces.
`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const contents = [
      { text: SYSTEM_PROMPT },
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
        { status: 500 }
      );
    }

    const editedImageBase64 = imagePart.inlineData.data;

    return NextResponse.json({ editedImageBase64 }, { status: 200 });
  } catch (error) {
    console.error("Gemini image edit error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
