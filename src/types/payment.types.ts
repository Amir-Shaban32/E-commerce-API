import { Document, Types } from "mongoose";

export interface IPayment extends Document{
    user_id: Types.ObjectId,
    order_id:Types.ObjectId,
    method:string | null,
    payment_intent_id:string,
    amount:number,
    currency:string,
    status:string,
    failure_reason:string | null
}