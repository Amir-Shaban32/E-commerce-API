import { Request,Response } from "express";
import {checkOwnershipOrAdmin} from '../middlewares/checkOwner';
import {
    getProductsServices,
    getProductService,
    updatedProductService, 
    addProductService, 
    deleteProductService
} from "../services/products.services";

//get all products
export const getProducts = async (req:Request , res:Response)=>{
    try{
        const features = getProductsServices(req.query);
        const products = await features.model;
        res.json({
            status: "success",
            length: products.length,
            data: products
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// get specific product
export const getProduct = async (req:Request , res:Response)=>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing product Id!"});

        const product = await getProductService(id);
        if(product.status===404)    return res.status(404).json({message:product.message});

        res.json({
            status: "success",
            data: product
        });        

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// add product
export const addProduct = async (req:Request , res:Response) =>{
    try{
        const newProduct = req.body;
        if(!newProduct) return res.status(400).json({message:"Missing Product's details"});

        const product = await addProductService(req.body);
        if(product.status===409)   return res.status(409).json({message:'Product already exists!'});
        if(!checkOwnershipOrAdmin(product.product , req))  return res.status(403).json({ message: "Forbidden" });

        if (product.status===400) {
            return res.status(400).json({
                status: "fail",
                message: product.message
            });
        }

        res.json({
            status: "success",
            message:product.message,
            data: product
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// update existing product
export const updateProduct = async (req:Request , res:Response) =>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing Prdouct Id!"});
        
        const product = await updatedProductService(id , req.body);
        if(!checkOwnershipOrAdmin(product.product , req))  return res.status(403).json({ message: "Forbidden" });
        
        if (product.status === 404) {
            return res.status(404).json({
                status: "fail",
                message: product.message
            });
        }
        if (product.status === 400) {
            return res.status(400).json({
                status: "fail",
                message: product.message
            });
        }
        
        res.json({
            status: "success",
            message:product.message,
            data: product.product
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

//delete existing product
export const deleteProduct = async (req:Request , res:Response) =>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing Product Id!"});

        const deletedProduct = await deleteProductService(id,req);
        if(deletedProduct.status!==200) 
            return res.status(deletedProduct.status).json({message:deletedProduct.message});

        res.json({
            status: "success",
            message: "Product deleted successfully"
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};
