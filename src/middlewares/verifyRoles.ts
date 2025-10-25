import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      role: number; 
    }
  }
}

export const verifyRoles = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.role) return res.sendStatus(401);
    if (!allowedRoles.includes(req.role)) return res.sendStatus(403);
    next();
  };
};