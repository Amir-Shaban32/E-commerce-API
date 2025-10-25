import mongoose , { Schema} from "mongoose";
import { IPayment } from "../types/payment.types";

const paymentSchema = new Schema<IPayment>({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },
    order_id:{
        type:Schema.Types.ObjectId,
        ref:"orders",
        required:true
    },
    method:{
        type:String,
    },
    payment_intent_id:{
        type: String
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String
    },
    status:{
        type:String,
        required:true
    },
    failure_reason:{
        type:String,
        default:null
    }
},{timestamps:true});

const paymentsModel = mongoose.model<IPayment>('Payments' , paymentSchema);

export default paymentsModel;
