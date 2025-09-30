"use client";

import { useSession } from "next-auth/react"; // Assuming you're using NextAuth
import { useState } from "react";
import { Button } from "../ui/button";

interface UpgradeButtonProps {
  productId: string; // Your Dodo Payments product ID for Pro plan
}

export default function UpgradeButton({ productId }: UpgradeButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session?.user?.email) {
      // Redirect to login or show error
      alert("Please log in first");
      return;
    }

    setLoading(true);

    try {
      // For static checkout using GET method
      const params = new URLSearchParams({
        productId: productId,
        quantity: "1",
        email: session.user.email,
        fullName: session.user.name || "",
        metadata_userEmail: session.user.email, // This will be available in webhook
        metadata_userId: session.user.id || "",
      });

      const response = await fetch(
        `/api/payments/checkout?${params.toString()}`,
      );
      const data = await response.json();

      if (data.checkout_url) {
        // Redirect to Dodo Payments checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert("Error starting checkout process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={loading} variant={"default"}>
      {loading ? "Processing..." : "Upgrade"}
    </Button>
  );
}
