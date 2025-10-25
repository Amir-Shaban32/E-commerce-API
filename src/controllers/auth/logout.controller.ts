import { Request, Response } from "express";
import userModel from "../../models/users.model";


export const handleLogout = async (req:Request , res:Response) =>{
    try{
        const cookies = req.cookies;
        if(!cookies?.token) return res.status(204).json({message:"No content!"});

        const refresh_token = cookies.token;

        const foundUser = await userModel.findOne({refreshTokens:refresh_token});
        if(!foundUser) return res.status(404).json({message:"User not found!"});

        foundUser.refreshTokens= foundUser.refreshTokens.filter(rt => rt!==refresh_token);

        await foundUser.save();

        res.clearCookie('token', { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ status: "ok", message: "Logged out" });
        
    } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({
      status: "fail",
      message: err.message
    });
  }
}