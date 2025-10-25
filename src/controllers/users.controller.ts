import { Request,Response } from "express";
import userModel from "../models/users.model";
import { IUsers } from "../types/users.types";
import { handleLogIn } from "../controllers/auth/login.controller";
import { handleRegister } from "../controllers/auth/register.controller";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import ApiFeatures from '../utils/apiFeatures';
import { deleteUserService, updateUserService } from "../services/users.services";

//get all users
export const getUsers = async (req:Request , res:Response)=>{
    try{
        const features = new ApiFeatures(userModel.find() , req.query).filter().limitFields().paginate().sort();
        const users = await features.model;
        res.json({
            status: `ok ${res.statusCode}`,
            length: users.length,
            data: users
        });
    } catch (error:any) {
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })
    };
}

// get specific user
export const getUser = async (req:Request , res:Response)=>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing user Id!"});

        const user = await userModel.findById(id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        if(!checkOwnershipOrAdmin(user , req))  return res.status(403).json({ message: "Forbidden" });
        
        res.json({
            status: `ok ${res.statusCode}`,
            data: user
        });        

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })          
    }
}

// sing in user
export const signInUser = async (req:Request , res:Response) =>{
    return handleLogIn<IUsers>(req,res);
}

// sing up user
export const registerUser = async (req:Request , res:Response) =>{
    return handleRegister<IUsers>(req,res);
}

// update existing user
export const updateUser = async (req:Request , res:Response) =>{
    try{
        const username = req.username;
        if(!username) return res.status(400).json({ message: "Missing username!" });

        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found!" });

        if(!checkOwnershipOrAdmin(user , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundUser = await updateUserService(username, req.body);
        if(foundUser.status === 404) return res.status(404).json({ message: foundUser.message });
        if (foundUser.status === 400) {
            return res.status(400).json({ message: foundUser.message });
        }

        res.json({
            status: `ok ${res.statusCode}`,
            message:foundUser.message,
            data: foundUser.user
        });

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })           
    }
};

//delete existing user
export const deleteUser = async (req:Request , res:Response) =>{
    try{

        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing user Id!"});

        const user = await userModel.findById(id);
        if(!user) return res.status(400).json({message:"User not found!"});
        // check if id comming from middleware is the same as id here
        if(!checkOwnershipOrAdmin(user , req))  return res.status(403).json({ message: "Forbidden" });
        
        const deletedUser = await deleteUserService(id);
        if(deletedUser.status === 404){
            return res.status(404).json({
                status:"fail",
                message: deletedUser.message 
            });
        } 
        
        res.json({
            status: `ok ${res.statusCode}`,
            message: deletedUser.message
        });

    }catch(error:any){
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message
        })           
    }
};