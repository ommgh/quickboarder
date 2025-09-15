const fileToPart = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const callModelAPI = async (action: string, params: any): Promise<string> => {
  try {
    const response = await fetch("/api/image/model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        ...params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while calling the API");
  }
};

export const generateModelImage = async (userImage: File): Promise<string> => {
  try {
    // Convert file to data URL
    const userImageDataUrl = await fileToPart(userImage);

    // Call the API
    return await callModelAPI("generateModel", {
      userImage: userImageDataUrl,
    });
  } catch (error) {
    console.error("Error generating model image:", error);
    throw error;
  }
};

export const generateVirtualTryOnImage = async (
  modelImageUrl: string,
  garmentImage: File,
): Promise<string> => {
  try {
    // Convert garment file to data URL
    const garmentImageDataUrl = await fileToPart(garmentImage);
    // Call the API
    return await callModelAPI("generateTryOn", {
      modelImage: modelImageUrl,
      garmentImage: garmentImageDataUrl,
    });
  } catch (error) {
    console.error("Error generating try-on image:", error);
    throw error;
  }
};

export const generatePoseVariation = async (
  tryOnImageUrl: string,
  poseInstruction: string,
): Promise<string> => {
  try {
    // Call the API
    return await callModelAPI("generatePose", {
      tryOnImage: tryOnImageUrl,
      poseInstruction,
    });
  } catch (error) {
    console.error("Error generating pose variation:", error);
    throw error;
  }
};

// Utility function to get friendly error messages (keeping your existing logic)
export const getFriendlyErrorMessage = (
  error: any,
  defaultMessage: string,
): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};
