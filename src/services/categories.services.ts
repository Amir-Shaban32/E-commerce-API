import{z} from 'zod';
import categoriesModel from '../models/category.model';
import { categoryValidation } from '../validation/categories.validation';
import ApiFeatures from '../utils/apiFeatures';


export const getCategoriesServices = (query: any) => {

  const features = new ApiFeatures(categoriesModel.find() , query)
    .filter()
    .limitFields()
    .paginate()
    .sort();

  return features;
};

export const getCategoryService = async(id:string)
    :Promise<{status:number , message?:string , category?:typeof categoriesModel.prototype}>=>{

    const foundProduct = await categoriesModel.findById(id);
    if(!foundProduct) return {status: 404,message: "Category not found!"};

    return {status:200, category:foundProduct};
};

export const addCategoryService = async(newCategory:any)
:Promise<{status:number , message?:any , category?:typeof categoriesModel.prototype}> =>{
    
    const dublicatCategory = await categoriesModel.findOne({name:newCategory.name});
    if(dublicatCategory)   return {status:409,message:'Category already exists!'};

    const valid = categoryValidation.safeParse(newCategory);
    if (!valid.success) {
        return {status: 400,message: z.treeifyError(valid.error)};
    }
    
    const category = await categoriesModel.create({...valid.data});
    return {status: 200,message: "Category added successfully" , category};
    
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



export const deleteCategoryService = async(id:string)
    :Promise<{status:number , message?:string }>=>{

    const foundCategory = await categoriesModel.findById(id);
    if(!foundCategory) return {status: 404,message: "Category not found!"};

    await categoriesModel.findByIdAndDelete(id);

    return {status:200};
};