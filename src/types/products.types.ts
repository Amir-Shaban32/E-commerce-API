import { Document , Types } from "mongoose";

export interface IProducts extends Document{
    name:string,
    description:string,
    category_id:Types.ObjectId,
    price:number,
    currency:string,
    brand:string,
    images:string[],
    stock_quantity:number,
    ratings:number
}