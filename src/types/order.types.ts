import mongoose, { Schema, Document } from "mongoose";

export interface order_item {
    product_id: mongoose.Types.ObjectId,
    quantity:number,
    price_at_purchase:number,
    status:string,
    cancelled_at?:Date | null,
    cancellation_reason?:string | null
}

interface Ishipping_address{
    country:string,
    city:string,
    street:string,
    zip:string
}

export interface IOrder extends Document{
    user_id:mongoose.Types.ObjectId,
    order_items:order_item[],
    shipping_address:Ishipping_address,
    payment_status:string,
    delivery_status:string,
    delivered_at:Date|null,
    phone_number:string,
    total:number,
    //stripe
    payment_intent_id?:string,
    refund_id?:string
    // cancellation
    cancelled_at:Date,
    cancellation_reason:string | null,
    cancelled_by:string|null,
    //return or refund
    return_requested_at:Date| null,
    return_reason:string| null,
    return_status:string| null,
    refund_amount:number| null,
    refunded_at:Date| null,
    completed_at:Date| null
}

export const orderItemSchema = new mongoose.Schema<order_item>({
    product_id:{
        type:Schema.Types.ObjectId,
        ref:"Products",
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    price_at_purchase:{
        type:Number,
        required:true,
        min:0
    },
    status:{
        type:String,
        default:"active",
        enum:["active" , "canceled"]
    },
    cancelled_at:{
        type:Date,
        default:null
    },
    cancellation_reason:{
        type:String,
        default:null
    }
},
{_id:false}
);