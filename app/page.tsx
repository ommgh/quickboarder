"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export default function Landing() {
  const router = useRouter();
  return (
    <div className=" flex items-center justify-center mt-10">
      <Button onClick={() => router.push("/auth/register")}>AUTH</Button>
    </div>
  );
}
