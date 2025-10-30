import { Request,Response } from "express";
import { IUsers } from "../types/users.types";
import { handleLogIn } from "../controllers/auth/login.controller";
import { handleRegister } from "../controllers/auth/register.controller";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import {
    getUsersServices,
    deleteUserService,
    getUserService, 
    updateUserService 
} from "../services/users.services";

//get all users
export const getUsers = async (req:Request , res:Response)=>{
    try{
        const features = getUsersServices(req.query);
        const users = await features.model;
        res.json({
            status: "success",
            length: users.length,
            data: users
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// get specific user
export const getUser = async (req:Request , res:Response)=>{
    try{
        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing user Id!"});

        const user = await getUserService(id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        if(!checkOwnershipOrAdmin(user , req))  return res.status(403).json({ message: "Forbidden" });
        
        res.json({
            status: "success",
            data: user
        });        

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
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

        const user = await getUserService(req.id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        if(!checkOwnershipOrAdmin(user , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundUser = await updateUserService(username, req.body);
        if(foundUser.status !== 200) 
            return res.status(foundUser.status).json({ message: foundUser.message });

        res.json({
            status: "success",
            message:foundUser.message,
            data: foundUser.user
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

//delete existing user
export const deleteUser = async (req:Request , res:Response) =>{
    try{

        const id = req.params.id;
        if(!id) return res.status(400).json({message:"Missing user Id!"});

        const user = await getUserService(req.id);
        if (!user) return res.status(404).json({ message: "User not found!" });
        if(!checkOwnershipOrAdmin(user , req))  
            return res.status(403).json({ message: "Forbidden" });
          
        const deletedUser = await deleteUserService(id);
        if(deletedUser.status !== 200){
            return res.status(deletedUser.status).json({
                status:"fail",
                message: deletedUser.message 
            });
        } 
        
        res.json({
            status: "success",
            message: deletedUser.message
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};