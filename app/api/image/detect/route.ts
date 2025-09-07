//file: app/api/detect/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_DETECTION_API_KEY!;

const DETECTION_PROMPT = `
Analyze this product image and provide detailed information for an e-commerce listing.

Your response must be a valid JSON object with the following structure:
{
  "productName": "string - A clear, marketable product name",
  "description": "string - A detailed product description for e-commerce (2-3 sentences)",
  "category": "string - Product category (e.g., 'artwork', 'furniture', 'decor', 'apparel')",
  "enhancementPrompt": "string - A detailed prompt describing how to enhance this specific product image for e-commerce listing",
  "confidence": "number - Confidence level between 0-1"
}

For the enhancementPrompt, be very specific about:
- The type of product and its characteristics
- The ideal setting/context for the product
- Lighting and background preferences
- Any styling suggestions specific to this product

Example enhancementPrompt: "Transform this hand-painted landscape artwork into a professional e-commerce listing by adding an elegant black frame and mounting it on a clean, modern living room wall with soft, natural lighting. Ensure the colors remain vibrant and accurate."

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. Your entire response must be a single JSON object.
`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const contents = [
      { text: DETECTION_PROMPT },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseModalities: ["Text"],
      },
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json(
        { error: "Failed to get detection response" },
        { status: 500 },
      );
    }

    // Clean the response in case it has markdown formatting
    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let detectionResult;
    try {
      detectionResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse detection response" },
        { status: 500 },
      );
    }

    // Validate the response structure
    if (
      !detectionResult.productName ||
      !detectionResult.description ||
      !detectionResult.enhancementPrompt
    ) {
      return NextResponse.json(
        { error: "Invalid detection response format" },
        { status: 500 },
      );
    }

    return NextResponse.json(detectionResult, { status: 200 });
  } catch (error) {
    console.error("Detection API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
