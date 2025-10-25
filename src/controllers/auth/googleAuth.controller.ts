import { Request , Response } from "express";
import userModel from "../../models/users.model";
import { generateTokens } from "../../utils/jwt";
import { comparePassword , hashePassword } from "../../utils/password";

interface GoogleUser{
  username:string,
  email:string
};

export const handleGoogle = async ({username,email}:GoogleUser) =>{
    let user = await userModel.findOne({ username});

    if(!user){
      const google_password = hashePassword(process.env.GOOGLE_PASSWORD!,10);
      user = await userModel.create({
        username,
        email,
        password:google_password
      });
    }
    return user;
};


export const handleCallback = async(req:Request , res:Response) =>{
    try{

        const user = req.user as any;
        const userPayload = { username: user.username, role: user.role ,id:user._id};
        const { accessToken, refreshToken } = generateTokens(userPayload);

        const cookies = req?.cookies;
        let newRefreshTokens = !cookies?.token
        ? user.refreshTokens
        : user.refreshTokens.filter((rt:string)=> rt !== cookies?.token);

        if(cookies?.token){
            const foundUser = await userModel.findOne({refreshTokens:cookies?.token});

            if(!foundUser)
                newRefreshTokens = [];

            res.clearCookie('token', { 
                httpOnly: true, 
                sameSite: 'none', 
                secure: true 
            });
        }

        user.refreshTokens = [...newRefreshTokens, refreshToken];
        user.last_login = new Date();
        await user.save();

        res.cookie('token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({
            status: `ok ${res.statusCode}`,
            accessToken:accessToken
        });
    }catch (error: any) {
        res.status(500).json({
            status: `fail ${res.statusCode}`,
            message: error.message,
        })
    }
};