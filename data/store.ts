import { db } from "@/lib/db";
export const getTotalProducts = async (userId: string) => {
  try {
    const products = await db.product.count({
      where: { userId },
    });
    return products;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export const getTotalModels = async (userId: string) => {
  try {
    const models = await db.models.count({
      where: { userId },
    });
    return models;
  } catch (e) {
    console.log(e);
    return 0;
  }
};
