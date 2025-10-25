import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types/category.types";
const categoriesSchema = new mongoose.Schema<ICategory>({
    name:{
        type:String,
        required:true
    },
    parent_category_id:{
        type:Schema.Types.ObjectId,
        ref:"category",
        default:null
    }
},{timestamps:true});

const categoriesModel = mongoose.model('categories' , categoriesSchema);

export default categoriesModel;