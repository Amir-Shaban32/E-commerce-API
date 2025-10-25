import mongoose , { Schema} from "mongoose";
import { IProducts} from "../types/products.types";

const productsSchema = new Schema<IProducts>({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    category_id:{
        type:Schema.Types.ObjectId,
        ref:"categories",
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true,
    },
    images:{
        type:[String], 
        default:[]
    },
    stock_quantity:{
        type:Number,
        required:true
    },
    ratings:{
        type:Number,
        default:0
    }
},{timestamps:true});

const productsModel = mongoose.model<IProducts>('Products' , productsSchema);

export default productsModel;
