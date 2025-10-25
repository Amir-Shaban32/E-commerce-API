import{z} from 'zod';
import categoriesModel from '../models/category.model';
import { categoryValidation } from '../validation/categories.validation';


export const getCategoryService = async(id:string)
    :Promise<{status:number , message?:string , category?:typeof categoriesModel.prototype}>=>{

    const foundProduct = await categoriesModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Category not found!"};

    return {status:200, category:foundProduct};
};


export const updatedCategoryService = async(id:string , updated:any)
    :Promise<{status:number , message:any , category?:typeof categoriesModel.prototype}>=>{
    const foundCategory = await categoriesModel.findById(id);
    if(!foundCategory) return {status: 404,message: "Category not found!"};

    const valid = categoryValidation.safeParse(updated);
    if (!valid.success) {
        return {status: 400,message: z.treeifyError(valid.error)};
    }

    const updatedCategory = await categoriesModel.findOneAndUpdate(
        {_id:id},
        valid.data,
        {new:true,runValidators:true}
    );

    return {status:200 , message:"Category updated successfully" , category:updatedCategory};
};

export const addCategoryService = async(newCategory:any)
    :Promise<{success:boolean , message?:any , category?:typeof categoriesModel.prototype}> =>{

        const valid = categoryValidation.safeParse(newCategory);
        if (!valid.success) {
            return {success: false,message: z.treeifyError(valid.error)};
        }

        const category = await categoriesModel.create({...valid.data});
        return {success: true,message: "Category added successfully" , category:category};

};


export const deleteCategoryService = async(id:string)
    :Promise<{status:number , message?:string }>=>{

        await categoriesModel.findByIdAndDelete(id);


    return {status:200};
};