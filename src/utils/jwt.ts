import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
dotenv.config();

const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY!;
const REFRESH_SECRET_KEY: string = process.env.REFRESH_SECRET_KEY!;

export function generateTokens(userPayload: object) {
    const accessToken: string = jwt.sign(
    {      
        "userInfo":userPayload
    },
    ACCESS_SECRET_KEY,  
      { expiresIn: '15m' }
    );  
    const refreshToken: string = jwt.sign(
    {
        "userInfo":userPayload
    },
    REFRESH_SECRET_KEY,  
      { expiresIn: '1d' }
    );
    
    return { accessToken, refreshToken };
}