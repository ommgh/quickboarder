/**
 * Converts a base64 data URL to a File object
 */
export function base64ToFile(base64Data: string, filename: string): File {
  // Handle both with and without data URL prefix
  const base64 = base64Data.startsWith("data:")
    ? base64Data.split(",")[1]
    : base64Data;

  // Convert base64 to binary
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Determine MIME type from data URL or default to PNG
  let mimeType = "image/png";
  if (base64Data.startsWith("data:")) {
    const match = base64Data.match(/data:([^;]+);/);
    if (match) {
      mimeType = match[1];
    }
  }

  return new File([bytes], filename, { type: mimeType });
}

/**
 * Gets image dimensions from a base64 string
 */
export function getImageDimensions(
  base64Data: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = reject;

    // Set source - handle both data URLs and plain base64
    img.src = base64Data.startsWith("data:")
      ? base64Data
      : `data:image/png;base64,${base64Data}`;
  });
}

/**
 * Estimates file size from base64 string
 */
export function estimateBase64Size(base64: string): number {
  // Remove data URL prefix if present
  const cleanBase64 = base64.startsWith("data:")
    ? base64.split(",")[1]
    : base64;

  // Base64 encoding increases size by ~33%, account for padding
  return Math.ceil((cleanBase64.length * 3) / 4);
}

/**
 * Generates a unique filename for product images
 */
export function generateProductImageFilename(productName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = productName
    ? productName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 20)
    : "product";

  return `${safeName}-${timestamp}-${random}.png`;
}
