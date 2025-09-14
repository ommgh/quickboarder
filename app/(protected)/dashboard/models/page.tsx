"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UploadCloudIcon } from "lucide-react";
import { generateModelImage } from "@/services/geminiService";
import Spinner from "@/components/Spinner";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSaveModel } from "@/hooks/use-save-model";

export default function Page() {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      console.log("Upload dataUrl from the user", dataUrl);
      setUserImageUrl(dataUrl);
      setIsGenerating(true);
      setGeneratedModelUrl(null);
      setError(null);
      setModelName("");
      try {
        const modelImage = await generateModelImage(file);
        console.log("Generated model image from gemini response:", modelImage);
        setGeneratedModelUrl(modelImage);
      } catch (err) {
        setError("Failed to create model");
        setUserImageUrl(null);
      } finally {
        setIsGenerating(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSaveModel = async () => {
    if (!generatedModelUrl || !modelName.trim()) {
      setError("Please provide a name for your model.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const modelData = {
      name: modelName.trim(),
    };
    const base64Data = generatedModelUrl.replace(
      /^data:image\/[a-z]+;base64,/,
      "",
    );
    console.log("Base64 Data from the save step:", base64Data);
    const result = await saveModel(modelData, base64Data);

    if (result.success) {
      toast({
        title: "Model saved successfully!",
        description: "The model has been added to collection.",
      });
    } else {
      toast({
        title: "Failed to save model",
        description: saveState.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
    setModelName("");
    setIsSaving(false);
  };

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  const { state: saveState, saveModel, reset: resetSave } = useSaveModel();
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {!userImageUrl ? (
            <motion.div
              key="uploader"
              className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="mb-12">
                <h1 className="text-3xl font-bold mb-6">
                  Create Your AI Model
                </h1>
                <p className="text-lg max-w-lg mx-auto">
                  Upload a photo and let our AI create a personalized model.
                  Perfect for fashion, design, and creative projects.
                </p>
              </div>

              <div className="w-full max-w-md">
                <label
                  htmlFor="image-upload-start"
                  className="w-full relative flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  <UploadCloudIcon className="w-6 h-6 mr-3" />
                  Upload Photo
                </label>
                <input
                  id="image-upload-start"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif"
                  onChange={handleFileChange}
                />

                <div className="mt-6 space-y-2 text-sm">
                  <p>Select a clear photo for best results</p>
                  <p className="text-xs">
                    By uploading, you agree to use this service responsibly
                  </p>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generator"
              className="w-full max-w-4xl mx-auto"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2">
                  Your AI Model
                </h1>
                <p>
                  {isGenerating
                    ? "Creating your personalized model..."
                    : "Your model is ready!"}
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Images Section */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div className=" rounded-xl overflow-hidden">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Original Photo</h3>
                      </div>
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={userImageUrl}
                          height={400}
                          width={400}
                          alt="Original uploaded photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Generated Model */}
                    <div className="rounded-xl overflow-hidden">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">AI Generated Model</h3>
                      </div>
                      <div className="aspect-[3/4] relative">
                        {isGenerating ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Spinner />
                              <p className="mt-4">Generating...</p>
                            </div>
                          </div>
                        ) : generatedModelUrl ? (
                          <Image
                            src={generatedModelUrl}
                            alt="AI generated model"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="">Model will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="lg:w-1/3">
                  <div className="rounded-xl p-6">
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-red-900">
                          Generation Failed
                        </p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                    )}

                    {generatedModelUrl && !isGenerating && !error && (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="model-name"
                            className="block text-sm font-semibold mb-2"
                          >
                            Model Name
                          </label>
                          <Input
                            id="model-name"
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            placeholder="Enter a name for your model"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent"
                            disabled={isSaving}
                          />
                        </div>

                        <Button
                          onClick={handleSaveModel}
                          disabled={isSaving || !modelName.trim()}
                          className="w-full px-6 py-3 text-base font-semibold rounded-lg disabled:cursor-not-allowed transition-colors"
                        >
                          {saveState.isUploading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {saveState.isSaving && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {saveState.isUploading
                            ? `Uploading... ${Math.round(saveState.uploadProgress)}%`
                            : saveState.isSaving
                              ? "Saving..."
                              : "Save Model"}
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={reset}
                      className="w-full mt-4 px-6 py-3 text-base font-semibold transition-colors"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
