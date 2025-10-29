import { Request,Response } from "express";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import { 
    getCartService,
    clearCartService, 
    updateCartService, 
    addItemService
} from "../services/cart.services";

// get specific cart
export const getCart = async (req:Request , res:Response)=>{
    try{
        const user_id = req.id;
        const cart = await getCartService(user_id);
        if(!cart) return res.status(404).json({message:"Cart not found!"});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });
     
        res.json({
            status: "success",
            data: cart
        });        

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// update existing cart
export const updateItem = async (req:Request , res:Response) =>{
    try{
        const {product_id,quantity} = req.body;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        if(!quantity || quantity<1) return res.status(400).json({message:"Invalid quantity!"});
        
        const user_id = req.id;

        const cart = await getCartService(user_id);
        if(!cart) return res.status(404).json({message:"Cart not found!"});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundCart = await updateCartService(user_id ,product_id , quantity);
        if(foundCart.status!==200) return res.status(foundCart.status).json({ message: foundCart.message });

        res.json({
            status: "success",
            message:foundCart.message,
            data: foundCart.cart
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const addItem = async (req:Request , res:Response)=>{
    try{
        const {product_id , quantity} = req.body;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        const user_id = req.id;

        const cart = await getCartService(user_id);
        if(!cart) return res.status(404).json({message:"Cart not found!"});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });
 
        const foundCart = await addItemService(user_id , product_id , quantity);
        if(foundCart.status!==200) return res.status(foundCart.status).json({ message: foundCart.message });
        
        res.json({
            status: "success",
            message: foundCart.message,
            data: foundCart.cart
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const deleteItem = async (req:Request , res:Response) =>{
    try{
        const product_id = req.params.product_id;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        const user_id = req.id;

        const cart = await getCartService(user_id);
        if(!cart) return res.status(404).json({message:"Cart not found!"});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });

        const foundCart = await clearCartService(user_id , product_id);
        if(foundCart.status!==200) return res.status(foundCart.status).json({ message: foundCart.message });

        res.json({
            status: "success",
            message: foundCart.message,
            data: foundCart.cart
        });    

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const clearCart = async (req:Request , res:Response)=>{
    try{
        const user_id = req.id;

        const cart = await getCartService(user_id);
        if(!cart) return res.status(404).json({message:"Cart not found!"});
        if(!checkOwnershipOrAdmin(cart , req))  return res.status(403).json({ message: "Forbidden" });

        const foundCart = await clearCartService(user_id);
        if(foundCart.status!==200) return res.status(foundCart.status).json({ message: foundCart.message });
        
        res.json({
            status: "success",
            message: foundCart.message
        });        

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};