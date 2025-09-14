import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(
  error: unknown,
  context: string,
): string {
  let rawMessage = "An unknown error occurred.";
  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "string") {
    rawMessage = error;
  } else if (error) {
    rawMessage = String(error);
  }

  // Check for specific unsupported MIME type error from Gemini API
  if (rawMessage.includes("Unsupported MIME type")) {
    try {
      // It might be a JSON string like '{"error":{"message":"..."}}'
      const errorJson = JSON.parse(rawMessage);
      const nestedMessage = errorJson?.error?.message;
      if (nestedMessage && nestedMessage.includes("Unsupported MIME type")) {
        const mimeType = nestedMessage.split(": ")[1] || "unsupported";
        return `File type '${mimeType}' is not supported. Please use a format like PNG, JPEG, or WEBP.`;
      }
    } catch (e) {
      // Not a JSON string, but contains the text. Fallthrough to generic message.
    }
    // Generic fallback for any "Unsupported MIME type" error
    return `Unsupported file format. Please upload an image format like PNG, JPEG, or WEBP.`;
  }

  return `${context}. ${rawMessage}`;
}
