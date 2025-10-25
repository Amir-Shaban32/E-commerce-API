import { Request , Response } from "express";
import dotenv from 'dotenv';
import  jwt  from "jsonwebtoken";
import userModel from "../../models/users.model";
import {JWTPayload} from '../../middlewares/authentication'
import { generateTokens } from "../../utils/jwt";
dotenv.config();

const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY!;

export const handleRefreshToken = async (req:Request , res:Response)=>{

    try{
        const cookies = req.cookies;
        if(!cookies.token) return res.status(401).json({message:"Unauthorized"});

        const refresh_token = cookies.token;
        res.clearCookie('token' , {httpOnly:true , sameSite:"none" , secure:true});

        const foundUser = await userModel.findOne({refresh_token});
        if(!foundUser){
            jwt.verify(refresh_token ,REFRESH_SECRET_KEY,
                async (err:any,decoded:any)=>{
                    if(err) return res.status(403).json({message:"Forbidden"});

                    const payload = decoded as JWTPayload
                    const hacked = await userModel.findOne({username:payload.userInfo.username});
                    if(hacked){
                        hacked.refreshTokens = [];
                        await hacked?.save()
                    }
                }
            )
            return res.status(403).json({message:"Forbidden"});
        }

        const newRefreshTokens = foundUser.refreshTokens.filter((rt:string)=> rt!== refresh_token);

        jwt.verify(refresh_token , REFRESH_SECRET_KEY , 
            async(err:any , decoded:any)=>{
                if(err){
                    foundUser.refreshTokens = [...newRefreshTokens];
                    await foundUser.save();
                }
                const payload  = decoded as JWTPayload
                if(payload.userInfo.username !== foundUser.username) 
                    return res.status(403).json({message:"Forbidden"});

                const userPayload = {username:foundUser.username , role:foundUser.role};
                const {accessToken , refreshToken} = generateTokens(userPayload);

                foundUser.refreshTokens = [...newRefreshTokens , refreshToken];
                foundUser.save();

                res.cookie('token' , refreshToken ,
                     { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

                res.json({
                status: `ok ${res.statusCode}`,
                data: foundUser,
                accessToken:accessToken
                });
            });

    } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({
      status: "fail",
      message: err.message
    });
  }
}