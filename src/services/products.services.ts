import{z} from 'zod';
import productModel from "../models/products.model";
import {updateProductValidation , createProductsValidation} from "../validation/products.validation";


export const getProductService = async(id:string)
    :Promise<{status:number , message?:string , product?:typeof productModel.prototype}>=>{

    const foundProduct = await productModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Product not found!"};

    return {status:200, product:foundProduct};
};


export const addProductService = async(newProduct:any)
:Promise<{success:boolean , message?:any , product?:typeof productModel.prototype}> =>{
    
    const valid = createProductsValidation.safeParse(newProduct);
    if (!valid.success) {
        return {success: false,message: z.treeifyError(valid.error)};
    }
    
    const product = await productModel.create({...valid.data});
    return {success: true,message: "Product added successfully" , product:product};
    
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


export const deleteProductService = async(id:string)
    :Promise<{status:number , message?:string }>=>{

        await productModel.findByIdAndDelete(id);


    return {status:200};
};