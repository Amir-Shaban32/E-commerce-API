import mongoose from "mongoose";
import ROLES_LIST from "../config/roles_list";
import { IUsers , TPayment_method} from "../types/users.types";

const usersSchema = new mongoose.Schema<IUsers>({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    phone_number:{
        type:String    
    },
    shipping_address:[{
        country:{type:String},
        city:{type:String,},
        street:{type:String},
        zip:{type:String}
    }],
    payment_method:[{
        type:{
            type:String,
            enum:["cash","card","wallet","paypal","bank_transfer"]
        },
        last4:{
            type:String,
            required: function(this:TPayment_method) {
                return this.type !== 'cash';
            }
        },
        provider:{
            type:String,
            required:function(this:TPayment_method){
                return this.type !== 'cash';
            }
        }
    }],
    last_login:{
        type:Date,
        default: Date.now()
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    refreshTokens:{
        type:[String], 
        default:[]
    },
    role:{
        type:Number,
        default:ROLES_LIST.user,
        enum:Object.values(ROLES_LIST)
    }
},{timestamps:true});

const userModel = mongoose.model<IUsers>('Users' , usersSchema);

export default userModel;
