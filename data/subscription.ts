import { db } from "@/lib/db";

export const getProductLimt = async (userId: string) => {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });
    return subscription?.productLimit;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const getModelLimt = async (userId: string) => {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });
    return subscription?.modelLimit;
  } catch (e) {
    console.log(e);
    return 0;
  }
};
