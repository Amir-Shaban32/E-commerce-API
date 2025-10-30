import userModel from "../models/users.model";
import mongoose from "mongoose";
import cartModel from "../models/cart.model";
import { updateUserValidation } from "../validation/user.validation";
import ApiFeatures from "../utils/apiFeatures";
import z from "zod";


export const getUsersServices = (query: any) => {

  const features = new ApiFeatures(userModel.find() , query)
    .filter()
    .limitFields()
    .paginate()
    .sort();

  return features;
};

export const getUserService = async(id:string)
    :Promise<{status:number , message?:string , user?:typeof userModel.prototype}>=>{

    const foundProduct = await userModel.findById(id);
    if(!foundProduct) return {status: 404,message: "User not found!"};

    return {status:200, user:foundProduct};
};

export const deleteUserService = async(id:string)
:Promise<{status:number , message?:any }>=>{
    const user = await userModel.findById(id);
    if(!user) return {status:404 , message:"user not found!"};

    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        await userModel.deleteOne({_id:user._id} , {session})

        await cartModel.deleteOne({user_id:user._id},{session});

        await session.commitTransaction();
        return {status:200 , message:"User deleted successfully"};

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        await session.abortTransaction();
        throw new Error(err.message || "Failed to delete user");
    }finally{
        await session.endSession();
    }
}


export const updateUserService = async(username:string , updated:any)
    :Promise<{status:number , message:any , user?: typeof userModel.prototype}> =>{
    const foundUser = await userModel.findOne({username:username});
    if(!foundUser) return {status:404 , message:"User not found"};

    const valid = updateUserValidation.safeParse(updated);
    if (!valid.success) {
        return {status: 400,message: z.treeifyError(valid.error)};
    }

    const updatedUser = await userModel.findOneAndUpdate(
        {username},
        valid.data,
        {new:true,runValidators:true}
    );

    return {status:200 , message:"User updated successfully" , user:updatedUser};
}