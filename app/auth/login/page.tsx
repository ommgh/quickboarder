"use client";

import { LoginForm } from "@/components/auth/login-form";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { canHandle3D } from "@/lib/deviceSupport";

const SimpleFallback = () => (
  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-black to-blue-950 p-8">
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-blue-500/20 p-4">
        <div className="h-full w-full rounded-full bg-blue-500/40 p-3">
          <div className="h-full w-full rounded-full bg-blue-500/80"></div>
        </div>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">QuickBoarder</h2>
      <p className="text-blue-200">Get Your Buisness Online in Minutes</p>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/30"></div>
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-blue-500/30"></div>
            <div className="h-2 w-24 rounded-full bg-blue-500/20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center bg-black">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const PackageSurface = dynamic(
  () => import("@/components/auth/3D/PackageSurface"),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  }
);

export default function LoginPage() {
  const [can3D, setCan3D] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCan3D(canHandle3D());
  }, []);

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-black w-full">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md sm:max-w-lg">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden h-full w-full overflow-hidden bg-black lg:block">
        {isMounted && (can3D ? <PackageSurface /> : <SimpleFallback />)}
      </div>
    </div>
  );
}
