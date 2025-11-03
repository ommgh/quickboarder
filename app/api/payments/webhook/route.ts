import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import type { WebhookPayload } from "dodopayments/resources/webhook-events.mjs";

export const POST = async (request: NextRequest) => {
  try {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret is not configured" },
        { status: 500 },
      );
    }

    const webhook = new Webhook(secret);
    const rawBody = await request.text();

    const webhookHeaders = {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    };

    await webhook.verify(rawBody, webhookHeaders);

    const payload = JSON.parse(rawBody) as WebhookPayload & {
      data: {
        product_id: string;
        subscription_id: string;
        status: string;
        next_billing_date: string;
        customer: { customer_id: string; email: string };
      };
    };

    const email = payload.data.customer.email;
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      product_id: productId,
      customer: { customer_id: dodoCustomerId },
      subscription_id: dodoSubscriptionId,
      status,
      next_billing_date: nextBillingDate,
    } = payload.data;

    const proProductId = process.env.DODO_PAYMENTS_PRO_SUB;
    const enterpriseProductId = process.env.DODO_PAYMENTS_ENTERPRISE_SUB;

    let subscriptionData: {
      name: "PRO" | "ENTERPRISE";
      productLimit: number;
      modelLimit: number;
      storeLimit: number;
      Analytics: boolean;
      Branding: boolean;
    } | null = null;

    if (proProductId && productId === proProductId) {
      subscriptionData = {
        name: "PRO",
        storeLimit: 5,
        productLimit: 100,
        modelLimit: 5,
        Analytics: true,
        Branding: false,
      };
    } else if (enterpriseProductId && productId === enterpriseProductId) {
      subscriptionData = {
        name: "ENTERPRISE",
        storeLimit: 25,
        productLimit: 1000,
        modelLimit: 50,
        Analytics: true,
        Branding: true,
      };
    } else {
      console.log("Unhandled product_id:", productId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await db.subscription.update({
      where: { userId: user.id },
      data: {
        name: subscriptionData.name,
        dodoCustomerId,
        dodoSubscriptionId,
        status,
        nextBillingDate,
        productLimit: subscriptionData.productLimit,
        modelLimit: subscriptionData.modelLimit,
        storeLimit: subscriptionData.storeLimit,
        Analytics: subscriptionData.Analytics,
        Branding: subscriptionData.Branding,
      },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }
};
