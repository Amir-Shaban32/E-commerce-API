import "express";

declare module "express-serve-static-core" {
  interface Request {
    username?: string;
    role?: number;
    id?:string
  }
}
