import cartModel from "../models/cart.model.js";
import { Types } from "mongoose";

export const updateCartService = async(user_id : string , product_id:string , quantity:number)
    :Promise<{success:boolean , message?:string , cart ?: typeof cartModel.prototype}>=>{

    const foundCart = await cartModel.findOne({user_id});
    if(!foundCart) return { success: false, message: "Cart not found" };

    const items = foundCart.items;
    const itemIndex = items.findIndex(item => item.product_id.toString() === product_id);

    if(itemIndex === -1) return {success:false , message:"Product not found!"};
    const item = items[itemIndex];
    if (!item) return { success: false, message: "Product not found" };
    item.quantity = quantity;

    await foundCart.save();

    return {success:true , message:"Item added to cart successfully" , cart:foundCart};
};

export const addItemService = async (
    user_id: string,
    product_id: string,
    quantity: number
  ): Promise<{ success: boolean; message?: string; cart?: typeof cartModel.prototype }> => {
    
    const foundCart = await cartModel.findOne({ user_id });
    if (!foundCart) {
      return { success: false, message: "Cart not found!" };
    }
  
    // Ensure product_id is valid
    if (!Types.ObjectId.isValid(product_id)) {
      return { success: false, message: "Invalid Product Id!" };
    }
  
    // Look for existing item
    const existingItem = foundCart.items.find(
      (item) => item.product_id?.toString() === product_id
    );
  
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      foundCart.items.push({
        product_id: new Types.ObjectId(product_id),
        quantity: quantity || 1,
      });
    }
  
    await foundCart.save();
  
    return { success: true, message: "Item added successfully", cart: foundCart };
};
  

export const clearCartService = async(user_id:string , product_id?:string):
    Promise<{success:boolean , message?:string , cart ?: typeof cartModel.prototype}>=>{
    const foundCart= await cartModel.findOne({user_id});
    if(!foundCart) return {success:false , message:"Cart not found!"};

    if(!product_id) foundCart.items = [];
    if(product_id){
        const items = foundCart.items;
        const itemIndex = items.findIndex(item => item.product_id.toString() === product_id);

        if(itemIndex === -1) return {success:false , message:"Product not found!"};

        items.splice(itemIndex,1);
    }

    await foundCart.save();

    return {success:true , message:"deleted successfully" , cart:foundCart};
}