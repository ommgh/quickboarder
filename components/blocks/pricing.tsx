"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { PaymentCreateResponse } from "dodopayments/resources/payments.mjs";

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    description: "Free for everyone",
    features: ["1 Store", "10 Products Catalog", "2 Default Models"],
  },
  {
    name: "Pro",
    monthlyPrice: "$10",

    features: [
      "Upto 5 Stores",
      "Upto 100 Products Catalog",
      "5 Custom Models",
      "Analytics Dashboard",
      "Custom Branding",
    ],
    productId: "pdt_ssW6HXq65rzlhoRZnHrbN",
  },
  {
    name: "Enterprise",
    monthlyPrice: "$99",

    features: [
      "Upto 25 Stores",
      "Upto 1000 Products Catalog",
      "50 Custom Models",
      "Analytics Dashboard",
      "Custom Branding",
      "Priority Support",
    ],
    productId: "pdt_L3eeBfmNkeLTUEdnfBWjJ",
  },
];

const handlePayment = async (productId?: string) => {
  if (!productId) {
    redirect("/dashboard");
  }

  const response = await fetch("/api/payments/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
    }),
  });

  const body = (await response.json()) as PaymentCreateResponse;
  if (body.payment_link) {
    window.location.href = body.payment_link;
  }
};

export const Pricing = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl leading-snug text-balance">
            Use Quickboarder for free with all the features. Upgrade to enable
            higher limits and premium features.
          </p>
        </div>

        <div className="mt-8 grid items-stretch gap-5 text-start md:mt-12 md:grid-cols-3 lg:mt-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`h-full ${
                plan.name === "Pro"
                  ? "outline-primary origin-top outline-2"
                  : ""
              }`}
            >
              <CardContent className="flex flex-col gap-7 px-6 py-5 h-full">
                <div className="flex-1 flex flex-col gap-6">
                  <div className="space-y-2">
                    <h3 className="text-foreground font-semibold">
                      {plan.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-lg font-medium">
                        {plan.monthlyPrice}
                        {plan.name !== "Free" && (
                          <span className="text-muted-foreground">/ month</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-muted-foreground text-sm">
                    {plan.description}
                  </span>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="text-muted-foreground flex items-center gap-1.5"
                      >
                        <Check className="size-5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    onClick={() => handlePayment(plan.productId)}
                  >
                    Get started
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
