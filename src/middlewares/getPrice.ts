import productsModel from "../models/products.model";
import { Types } from "mongoose";

export const getPrice = async (product_id: Types.ObjectId): Promise<number> => {
    const foundProduct = await productsModel.findById(product_id);
    if (!foundProduct) {
      throw new Error("Product not found");
    }
    return foundProduct.price;
};
  