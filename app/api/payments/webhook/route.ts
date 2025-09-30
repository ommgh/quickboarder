import { auth } from "@/auth";
import { Webhooks } from "@dodopayments/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,
  onPaymentSucceeded: async () => {
    try {
      const session = await auth();
      if (!session) {
        throw new Error("Unauthorized");
      }
      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      // Update user's plan to PRO
      await prisma.user.update({
        where: { email: userEmail },
        data: { plan: "PRO" },
      });

      console.log(`User ${userEmail} upgraded to PRO plan`);
    } catch (error) {
      console.error("Error updating user plan:", error);
    }
  },
  onPaymentFailed: async (payload) => {
    console.log("Payment failed:", payload);
    // Handle failed payment if needed
  },
});
