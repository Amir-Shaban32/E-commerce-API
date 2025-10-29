import cartModel from "../models/cart.model.js";
import { Types } from "mongoose";

export const getCartService = async(user_id:string)=>{
    const cart = await cartModel.findOne({user_id});
    if(!cart) return null;

    return cart;
}

export const updateCartService = async(user_id : string , product_id:string , quantity:number)
    :Promise<{status:number , message?:string , cart ?: typeof cartModel.prototype}>=>{

    const foundCart = await cartModel.findOne({user_id});
    if(!foundCart) return { status: 404, message: "Cart not found" };

    const items = foundCart.items;
    const itemIndex = items.findIndex(item => item.product_id.toString() === product_id);

    if(itemIndex === -1) return {status: 404 , message:"Product not found!"};
    const item = items[itemIndex];
    if (!item) return { status: 404, message: "Product not found" };
    item.quantity = quantity;

    await foundCart.save();

    return {status: 200 , message:"Item added to cart successfully" , cart:foundCart};
};

export const addItemService = async (user_id: string,product_id: string,quantity: number)
  : Promise<{ status: number; message?: string; cart?: typeof cartModel.prototype }> => {
    
    const foundCart = await cartModel.findOne({ user_id });
    if (!foundCart) {
      return { status: 404, message: "Cart not found!" };
    }
  
    // Ensure product_id is valid
    if (!Types.ObjectId.isValid(product_id)) {
      return { status: 400, message: "Invalid Product Id!" };
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
  
    return { status: 200, message: "Item added successfully", cart: foundCart };
};
  

export const clearCartService = async(user_id:string , product_id?:string):
    Promise<{status: number , message?:string , cart ?: typeof cartModel.prototype}>=>{
    const foundCart= await cartModel.findOne({user_id});
    if(!foundCart) return {status: 404 , message:"Cart not found!"};

    if(!product_id) foundCart.items = [];
    if(product_id){
        const items = foundCart.items;
        const itemIndex = items.findIndex(item => item.product_id.toString() === product_id);

        if(itemIndex === -1) return {status: 404 , message:"Product not found!"};

        items.splice(itemIndex,1);
    }

    await foundCart.save();

    return {status: 200 , message:"deleted successfully" , cart:foundCart};
}