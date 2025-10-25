import mongoose, {Schema} from "mongoose";
import { IOrder , orderItemSchema} from "../types/order.types";

const ordersSchema = new Schema<IOrder>({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    order_items:[orderItemSchema],
    shipping_address:[{
        country:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        street:{
            type:String,
            required:true
        },
        zip:{
            type:String,
            required:true
        }
    }],
    payment_status:{
        type:String,
        required:true,
        enum:['processing','pending', 'paid','refunded','cancelled']
    },
    delivery_status:{
        type:String,
        required:true,
        enum:['pending','out_for_delivery', 'delivered','cancelled']
    },
    delivered_at:{
        type:Date,
        default:null
    },
    phone_number:{
        type:String,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    payment_intent_id:{
        type:String,
        default:null
    },
    refund_id:{
        type:String,
        default:null
    },
    cancelled_at:{
        type:Date,
        default:null,
        select:false
    },
    cancellation_reason:{
        type:String,
        default:null,
        select:false
    },
    cancelled_by: { 
        type: String, 
        enum: ['customer', 'admin', 'system'],
        default: null 
    },
    return_requested_at: { type: Date, default: null },
    return_reason: { type: String, default: null },
    return_status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none'
    },
    refund_amount: { type: Number, default: 0 },
    refunded_at: { type: Date, default: null },
    // Completion
    completed_at: { type: Date, default: null },
},{timestamps:true});

const ordersModel = mongoose.model('orders' , ordersSchema);

export default ordersModel;