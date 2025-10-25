import { Request , Response } from "express";
import { comparePassword } from "../../utils/password";
import { generateTokens } from "../../utils/jwt";
import { Document } from "mongoose";
import userModel from "../../models/users.model";

interface ILogIn{
    username:string,
    password:string,
    refreshTokens:string[]
}

export const handleLogIn = async <T extends Document & ILogIn>
 (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findOne({ username }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userPayload = { username: user.username, role: user.role ,id:user._id};
    const { accessToken, refreshToken } = generateTokens(userPayload);

    const cookies = req?.cookies;
    let newRefreshTokens = !cookies?.token 
      ? user.refreshTokens
      : user.refreshTokens.filter((rt: string) => rt !== cookies?.token);

    // Check for refresh token reuse (potential attack)
    if (cookies?.token) {
      const foundUser = await userModel.findOne({ 
        refreshTokens: cookies.token 
      });
      
      // Token reuse detected - clear all tokens
      if (!foundUser) {
        newRefreshTokens = [];
      }
      
      res.clearCookie('token', { 
        httpOnly: true, 
        sameSite: 'none', 
        secure: true 
      });
    }

    // Update user with new refresh token
    user.refreshTokens = [...newRefreshTokens, refreshToken];
    user.last_login = new Date();
    await user.save();

    // Set new cookie
    res.cookie('token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      status: `ok ${res.statusCode}`,
      data: user,
      accessToken:accessToken
    });

  }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message,
        })
    }
};
