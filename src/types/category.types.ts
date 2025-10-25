import { Document , Types } from "mongoose";

export interface ICategory extends Document{
    name:string,
    parent_category_id:Types.ObjectId
}