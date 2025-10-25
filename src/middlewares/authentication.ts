import {Request , Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY!;

//extend Request interface to use username
declare global{
    namespace Express{
        interface Request{
            username?:string,
            role:number,
            id:string
        }
    }
}

export interface JWTPayload{
    userInfo:{
        username:string,
        role:number,
        id:string
    }
}

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const Headers = req.headers.authorization as string;
    
    if (!Headers || !Headers.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    
    const token = Headers.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    
    jwt.verify(token, ACCESS_SECRET_KEY, (err: any, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden!" }); 
      }
      
      if (decoded) {
        const payload = decoded as JWTPayload;
        req.username = payload.userInfo.username;
        req.role = payload.userInfo.role;
        req.id = payload.userInfo.id;
      }
      
      next(); 
    });
  };


