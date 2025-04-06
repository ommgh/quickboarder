"use cleint";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_AUTH_REDIRECT } from "@/routes";
export const Social = () => {
  const onClick = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: DEFAULT_AUTH_REDIRECT });
  };
  return (
    <div className="flex items-center w-full gap-x-3">
      <Button
        size="lg"
        className="w-full gap-x-2"
        variant="outline"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
    </div>
  );
};
