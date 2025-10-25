import { Document, Types , Schema } from "mongoose"

export interface cartItem{
    product_id:Types.ObjectId,
    quantity:number
}

export interface ICart extends Document{
    user_id:Types.ObjectId,
    items:cartItem[],
    updated_at:Date,
    created_at:Date,
}

export const cartItemSchema = new Schema<cartItem>({
    product_id:{
        type:Schema.Types.ObjectId,
        ref:'Products',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
},
{_id:false}
)