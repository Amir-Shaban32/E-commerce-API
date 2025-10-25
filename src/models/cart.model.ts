import mongoose , {Schema} from "mongoose";
import { ICart , cartItemSchema} from "../types/cart.types";

const cartSchema = new Schema<ICart>({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },
    items:[cartItemSchema],
    updated_at:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true});

const cartModel = mongoose.model('cart' , cartSchema);

export default cartModel;