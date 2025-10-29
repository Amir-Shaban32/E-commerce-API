import{z} from 'zod';
import { Request } from 'express';
import productModel from "../models/products.model";
import {updateProductValidation , createProductsValidation} from "../validation/products.validation";
import ApiFeatures from '../utils/apiFeatures';
import { checkOwnershipOrAdmin } from '../middlewares/checkOwner';

export const getProductsServices = (query: any) => {

  const features = new ApiFeatures(productModel.find() , query)
    .filter()
    .limitFields()
    .paginate()
    .sort();

  return features;
};

export const getProductService = async(id:string)
    :Promise<{status:number , message?:string , product?:typeof productModel.prototype}>=>{

    const foundProduct = await productModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Product not found!"};

    return {status:200, product:foundProduct};
};


export const addProductService = async(newProduct:any)
:Promise<{status:number , message?:any , product?:typeof productModel.prototype}> =>{
    
    const dublicatProduct = await productModel.findOne({name:newProduct.name});
    if(dublicatProduct)   return {status:409,message:'Product already exists!'};

    const valid = createProductsValidation.safeParse(newProduct);
    if (!valid.success) {
        return {status: 400,message: z.treeifyError(valid.error)};
    }
    
    const product = await productModel.create({...valid.data});
    return {status: 200,message: "Product added successfully" , product:product};
    
};

export const updatedProductService = async(id:string , updated:any)
    :Promise<{status:number , message:any , product?:typeof productModel.prototype}>=>{
    const foundProduct = await productModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Product not found!"};

    const valid = updateProductValidation.safeParse(updated);
    if (!valid.success) {
        return {status: 400,message: z.treeifyError(valid.error)};
    }

    const updatedProduct = await productModel.findOneAndUpdate(
        {_id:id},
        valid.data,
        {new:true,runValidators:true}
    );

    return {status:200 , message:"Product updated successfully" , product:updatedProduct};
};


export const deleteProductService = async(id:string,req:Request)
    :Promise<{status:number , message?:string }>=>{

    const foundProduct = await productModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Product not found!"};
    if(!checkOwnershipOrAdmin(foundProduct , req))  return {status:403 , message: "Forbidden" };

    await productModel.findByIdAndDelete(id);

    return {status:200};
};