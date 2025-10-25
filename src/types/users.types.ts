import {Document} from 'mongoose';

interface Ishipping_address{
    country:String,
    city:String,
    street:String,
    zip:String
}

type payment_method = "cash" | "card" | "wallet" | "paypal" | "bank_transfer";
type non_cash = Exclude<payment_method,"cash">;
export type TPayment_method=
    |{
        type:"cash";
        last4?:never;
        provider?:never;
    }
    |{
        type:non_cash;
        last4:string;
        provider:string;
    }

export interface IUsers extends Document{
    username:string,
    email:string,
    phone_number:string,
    shipping_address:Ishipping_address,
    payment_method:TPayment_method[],
    last_login:Date,
    password:string,
    refreshTokens:string[],
    role:number
}
