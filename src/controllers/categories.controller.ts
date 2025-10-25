import { Request,Response } from "express";
import ApiFeatures from '../utils/apiFeatures'
import categoryModel from "../models/category.model";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import {
    getCategoryService,
    addCategoryService, 
    updatedCategoryService,
    deleteCategoryService
} from "../services/categories.services";

//get all Categories
export const getCategories = async (req:Request , res:Response)=>{
    try{
        const features = new ApiFeatures(categoryModel.find() , req.query).filter().limitFields().paginate().sort();
        const categories = await features.model;
        res.json({
            status: `ok ${res.statusCode}`,
            length: categories.length,
            data: categories
        });
    } catch (error:any) {
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })
    };
}

// get specific Category
export const getCategory = async (req:Request , res:Response)=>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing category Id!"});

        const category = await getCategoryService(id);
        if(category.status===404)    return res.status(404).json({message:category.message});

        res.json({
            status: `ok ${res.statusCode}`,
            data: category
        });        

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })          
    }
}

// add Category
export const addCategory = async (req:Request , res:Response) =>{

    try{
        const newCategory = req.body;
        if(!newCategory) return res.status(400).json({message:"Missing category details"});

        const dublicateCategory = await categoryModel.findOne({name:newCategory.name});
        if(dublicateCategory)   return res.status(409).json({message:'Category already exists!'});
        if(!checkOwnershipOrAdmin(dublicateCategory , req))  return res.status(403).json({ message: "Forbidden" });

        const category = await addCategoryService(newCategory);
        if (!category.success) {
            return res.status(400).json({
                status: "fail",
                message: category.message
            });
        }

        res.json({
            status: `ok ${res.statusCode}`,
            message:category.message,
            data: category
        });
    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })          
    }
}

// update existing Category
export const updateCategory = async (req:Request , res:Response) =>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing Id!"});
        
        const product = await categoryModel.findById(id);
        if(!checkOwnershipOrAdmin(product , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundCategory = await updatedCategoryService(id,req.body);
        if(foundCategory.status === 404) return res.status(404).json({ message: foundCategory.message });

        if (foundCategory.status === 400) {
            return res.status(400).json({
                status: "fail",
                message: foundCategory.message
            });
        }

        res.json({
            status: `ok ${res.statusCode}`,
            message:foundCategory.message,
            data: foundCategory.category
        });

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })           
    }
};

//delete existing Category
export const deleteCategory = async (req:Request , res:Response) =>{
    try{

        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing Category Id!"});

        const Category = await categoryModel.findById(id);
        if(!Category) return res.status(404).json({ message: "Category not found!" });
        if(!checkOwnershipOrAdmin(Category , req))  return res.status(403).json({ message: "Forbidden" });

        await deleteCategoryService(id);
        res.json({
            status: `ok ${res.statusCode}`,
            message: "Category deleted successfully"
        });

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })           
    }
};
