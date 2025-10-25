import { Request,Response } from "express";
import ApiFeatures from '../utils/apiFeatures'
import productModel from "../models/products.model";
import {checkOwnershipOrAdmin} from '../middlewares/checkOwner';
import {
    getProductService,
    updatedProductService, 
    addProductService, 
    deleteProductService
} from "../services/products.services";

//get all products
export const getProducts = async (req:Request , res:Response)=>{
    try{
        const features = new ApiFeatures(productModel.find() , req.query).filter().limitFields().paginate().sort();
        const products = await features.model;
        res.json({
            status: `ok ${res.statusCode}`,
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
            status: `ok ${res.statusCode}`,
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

        const dublicatProduct = await productModel.findOne({name:newProduct.name});
        if(dublicatProduct)   return res.status(409).json({message:'Product already exists!'});
        if(!checkOwnershipOrAdmin(dublicatProduct , req))  return res.status(403).json({ message: "Forbidden" });

        const product = await addProductService(req.body);
        if (!product.success) {
            return res.status(400).json({
                status: "fail",
                message: product.message
            });
        }

        res.json({
            status: `ok ${res.statusCode}`,
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
        
        const product = await productModel.findById(id);
        if(!checkOwnershipOrAdmin(product , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundProduct = await updatedProductService(id , req.body);
        if(foundProduct.status === 404) return res.status(404).json({ message: foundProduct.message });
        
        if (foundProduct.status === 404) {
            return res.status(404).json({
                status: "fail",
                message: foundProduct.message
            });
        }
        if (foundProduct.status === 400) {
            return res.status(400).json({
                status: "fail",
                message: foundProduct.message
            });
        }
        
        res.json({
            status: `ok ${res.statusCode}`,
            message:foundProduct.message,
            data: foundProduct.product
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

        const foundProduct = await productModel.findById(id);
        if(!foundProduct) return res.status(404).json({message:"Product not found"});
        if(!checkOwnershipOrAdmin(foundProduct , req))  return res.status(403).json({ message: "Forbidden" });

        await deleteProductService(id);

        res.json({
            status: `ok ${res.statusCode}`,
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
