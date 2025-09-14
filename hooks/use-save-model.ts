import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import {
  base64ToFile,
  getImageDimensions,
  generateProductImageFilename,
} from "@/utils/image-utils";

export interface ModelData {
  name: string;
}

export interface SaveModelState {
  isUploading: boolean;
  isSaving: boolean;
  uploadProgress: number;
  error: string | null;
  success: boolean;
}

export interface UseSaveModelReturn {
  state: SaveModelState;
  saveModel: (
    modelData: ModelData,
    enhancedImageBase64: string,
  ) => Promise<{ success: boolean; modelId?: string }>;
  reset: () => void;
}

export const useSaveModel = (): UseSaveModelReturn => {
  const [state, setState] = useState<SaveModelState>({
    isUploading: false,
    isSaving: false,
    uploadProgress: 0,
    error: null,
    success: false,
  });

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: `Upload failed: ${error.message}`,
      }));
    },
    onUploadProgress: (progress) => {
      setState((prev) => ({
        ...prev,
        uploadProgress: progress,
      }));
    },
  });

  const updateState = (updates: Partial<SaveModelState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const saveModel = async (
    modelData: ModelData,
    enhancedImageBase64: string,
  ): Promise<{ success: boolean; modelId?: string }> => {
    try {
      updateState({
        isUploading: true,
        isSaving: false,
        uploadProgress: 0,
        error: null,
        success: false,
      });

      const filename = generateProductImageFilename(modelData.name);
      const imageFile = base64ToFile(enhancedImageBase64, filename);

      const dimensions = await getImageDimensions(enhancedImageBase64);

      const uploadResult = await startUpload([imageFile]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Image upload failed - no result returned");
      }

      const uploadedFile = uploadResult[0];
      if (!uploadedFile.ufsUrl) {
        throw new Error("Image upload failed - no URL returned");
      }

      updateState({
        isUploading: false,
        isSaving: true,
        uploadProgress: 100,
      });

      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelData.name,
          ImageUrl: uploadedFile.ufsUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const result = await response.json();

      updateState({
        isSaving: false,
        success: true,
      });

      return {
        success: true,
        modelId: result.product.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      updateState({
        isUploading: false,
        isSaving: false,
        error: errorMessage,
      });

      return { success: false };
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      isSaving: false,
      uploadProgress: 0,
      error: null,
      success: false,
    });
  };

  return {
    state,
    saveModel,
    reset,
  };
};
