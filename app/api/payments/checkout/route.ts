import { auth } from "@/auth";
import { dodopayments } from "@/lib/payments";
import { APIError } from "dodopayments";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const validator = z.object({
  productId: z.string(),
});
export const POST = async (request: NextRequest) => {
  const session = await auth();
  const body = await request.json();
  const paredBody = validator.safeParse(body);
  if (paredBody.success) {
    const { productId } = paredBody.data;
    try {
      const checkoutSession = await dodopayments.subscriptions.create({
        billing: {
          city: "",
          country: "IN",
          state: "",
          street: "",
          zipcode: "",
        },
        customer: {
          email: session?.user.email || "",
          name: session?.user.name,
        },
        product_id: productId,
        quantity: 1,
        payment_link: true,
        return_url: process.env.DODO_PAYMENTS_RETURN_URL,
      });
      return NextResponse.json(checkoutSession, {
        status: 200,
      });
    } catch (e) {
      const dodopaymentsError = e as APIError;
      return NextResponse.json(dodopaymentsError.message, {
        status: dodopaymentsError.status,
      });
    }
  }
};
