import { Request,Response } from "express";
import cartModel from "../models/cart.model";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import { clearCartService  , updateCartService , addItemService } from "../services/cart.services";

// get specific cart
export const getCart = async (req:Request , res:Response)=>{
    try{
        const user_id = req.id;
        const cart = await cartModel.findOne({user_id});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });
        res.json({
            status: `ok ${res.statusCode}`,
            data: cart
        });        

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })          
    }
}

// update existing cart
export const updateItem = async (req:Request , res:Response) =>{
    try{
        const {product_id,quantity} = req.body;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        if(!quantity || quantity<1) return res.status(400).json({message:"Invalid quantity!"});
        
        const user_id = req.id;
        const foundCart = await updateCartService(user_id ,product_id , quantity);
        if(!foundCart.success) return res.status(404).json({ message: foundCart.message });
        if(!checkOwnershipOrAdmin(foundCart.cart , req))  return res.status(403).json({ message: "Forbidden" });

        res.json({
            status: `ok ${res.statusCode}`,
            message:foundCart.message,
            data: foundCart.cart
        });

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })           
    }
};

export const addItem = async (req:Request , res:Response)=>{
    try{
        const {product_id , quantity} = req.body;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        const user_id = req.id;
        const foundCart = await addItemService(user_id , product_id , quantity);
        if(!foundCart.success) return res.status(404).json({ message: foundCart.message });
        if(!checkOwnershipOrAdmin(foundCart.cart , req))  return res.status(403).json({message: "Forbidden"});
        
        res.json({
            status: `ok ${res.statusCode}`,
            message: foundCart.message,
            data: foundCart.cart
          });
    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        });             
    }
};

export const deleteItem = async (req:Request , res:Response) =>{
    try{
        const product_id = req.params.product_id;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        const user_id = req.id;
        const foundCart = await clearCartService(user_id , product_id);
        if(!foundCart.success) return res.status(404).json({ message: foundCart.message });
        if(!checkOwnershipOrAdmin(foundCart.cart , req))  return res.status(403).json({message: "Forbidden"});

        res.json({
            status: `ok ${res.statusCode}`,
            message: foundCart.message,
            data: foundCart.cart
        });    
    }catch(error:any){
        console.log("Error:",error);
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        });   
    }
};

export const clearCart = async (req:Request , res:Response)=>{
    try{
        const user_id = req.id;
        const foundCart = await clearCartService(user_id);
        if(!foundCart.success) return res.status(404).json({ message: foundCart.message });
        if(!checkOwnershipOrAdmin(foundCart.cart , req))  return res.status(403).json({ message: "Forbidden" });
        
        res.json({
            status: `ok ${res.statusCode}`,
            message: foundCart.message
        });        

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })          
    }   
};