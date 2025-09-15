import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_MODEL_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = "gemini-2.5-flash-image-preview";

/** Convert ArrayBuffer to base64 using Web APIs */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/** Parse a data: URL (synchronous) */
const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } => {
  const arr = dataUrl.split(",");
  if (arr.length < 2) throw new Error("Invalid data URL");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1])
    throw new Error("Could not parse MIME type from data URL");
  return { mimeType: mimeMatch[1], data: arr[1] };
};

/** Fetch an HTTP(S) image and return mime + base64 data */
const fetchImageUrlToBase64 = async (
  url: string,
): Promise<{ mimeType: string; data: string }> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch image from URL: ${res.status} ${res.statusText}`,
    );
  }
  const contentType =
    (res.headers.get("content-type") || "").split(";")[0] || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error(
      `URL did not return an image. Content-Type: ${contentType}`,
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  return { mimeType: contentType, data: base64 };
};

/** Accepts either a data: URL or http(s) URL and returns an inlineData Part for Gemini */
const toInlineImagePart = async (input: string) => {
  if (input.startsWith("data:")) {
    const { mimeType, data } = parseDataUrl(input);
    return { inlineData: { mimeType, data } };
  }
  if (/^https?:\/\//i.test(input)) {
    const { mimeType, data } = await fetchImageUrlToBase64(input);
    return { inlineData: { mimeType, data } };
  }
  throw new Error(
    "Unsupported image input. Provide a data: URL or an https:// URL. (Convert blob: URLs client-side first.)",
  );
};

const handleApiResponse = (response: GenerateContentResponse): string => {
  if (response.promptFeedback?.blockReason) {
    const { blockReason, blockReasonMessage } = response.promptFeedback;
    const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ""}`;
    throw new Error(errorMessage);
  }

  for (const candidate of response.candidates ?? []) {
    const imagePart = candidate.content?.parts?.find((part) => part.inlineData);
    if (imagePart?.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
    throw new Error(errorMessage);
  }

  const textFeedback = response.text?.trim();
  const errorMessage =
    `The AI model did not return an image. ` +
    (textFeedback
      ? `The model responded with text: "${textFeedback}"`
      : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
  throw new Error(errorMessage);
};

// --------- Image generation functions ---------

// Generate Model Image
const generateModelImage = async (
  userImageDataUrl: string,
): Promise<string> => {
  const userImagePart = await toInlineImagePart(userImageDataUrl);

  const prompt =
    "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo suitable for an e-commerce website. The background must be a clean, neutral studio backdrop (light gray, #f0f0f0). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";

  const response = await ai.models.generateContent({
    model,
    contents: [userImagePart, { text: prompt }],
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });

  return handleApiResponse(response);
};

// Generate Virtual Try-On Image
const generateVirtualTryOnImage = async (
  modelImageUrl: string,
  garmentImageDataUrl: string,
): Promise<string> => {
  const modelImagePart = await toInlineImagePart(modelImageUrl);
  const garmentImagePart = await toInlineImagePart(garmentImageDataUrl);

  const prompt = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1.  **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2.  **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3.  **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly.
4.  **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5.  **Output:** Return ONLY the final, edited image. Do not include any text.`;

  const response = await ai.models.generateContent({
    model,
    contents: [modelImagePart, garmentImagePart, { text: prompt }],
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });

  return handleApiResponse(response);
};

// Generate Pose Variation
const generatePoseVariation = async (
  tryOnImageUrl: string,
  poseInstruction: string,
): Promise<string> => {
  const tryOnImagePart = await toInlineImagePart(tryOnImageUrl);

  const prompt = `You are an expert fashion photographer AI. Take this image and regenerate it from a different perspective. The person, clothing, and background style must remain identical. The new perspective should be: "${poseInstruction}". Return ONLY the final image.`;

  const response = await ai.models.generateContent({
    model,
    contents: [tryOnImagePart, { text: prompt }],
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });

  return handleApiResponse(response);
};

// --------- API Route Handler ---------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    let result: string;

    switch (action) {
      case "generateModel": {
        const { userImage } = params;
        if (!userImage) {
          return NextResponse.json(
            { error: "userImage is required for generateModel action" },
            { status: 400 },
          );
        }
        result = await generateModelImage(userImage);
        break;
      }

      case "generateTryOn": {
        const { modelImage, garmentImage } = params;
        if (!modelImage || !garmentImage) {
          return NextResponse.json(
            {
              error:
                "modelImage and garmentImage are required for generateTryOn action",
            },
            { status: 400 },
          );
        }
        result = await generateVirtualTryOnImage(modelImage, garmentImage);
        break;
      }

      case "generatePose": {
        const { tryOnImage, poseInstruction } = params;
        if (!tryOnImage || !poseInstruction) {
          return NextResponse.json(
            {
              error:
                "tryOnImage and poseInstruction are required for generatePose action",
            },
            { status: 400 },
          );
        }
        result = await generatePoseVariation(tryOnImage, poseInstruction);
        break;
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: generateModel, generateTryOn, generatePose",
          },
          { status: 400 },
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
