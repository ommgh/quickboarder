"use client";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_AUTH_REDIRECT } from "@/routes";
import { toast } from "sonner";

export const Social = () => {
  const onClick = async (provider: "google") => {
    const toastId = toast.loading("Redirecting to Google...");
    try {
      await signIn(provider, { callbackUrl: DEFAULT_AUTH_REDIRECT });
      toast.success("Redirected successfully!", { id: toastId });
    } catch {
      toast.error("Login redirect failed", { id: toastId });
    }
  };

  return (
    <div className="flex items-center w-full gap-x-4">
      <Button
        size="lg"
        className="w-full gap-x-2"
        variant="outline"
        onClick={() => onClick("google")}
      >
        Continue With Google
        <FcGoogle className="h-5 w-5" />
      </Button>
    </div>
  );
};
