import { Request, Response } from "express";
import {createUserValidation} from '../../validation/user.validation';
import { hashePassword } from "../../utils/password";
import mongoose, {Document } from "mongoose";
import userModel from "../../models/users.model";
import cartModel from "../../models/cart.model";
import {z} from 'zod';

interface IRegister{
  username:string,
  password:string
};

export const handleRegister = async <T extends Document & IRegister>
   (req: Request, res: Response) => {
  try {
    const newUser = req.body;
    
    if (!newUser?.username || !newUser?.password) {
      return res.status(400).json("Username and password are required");
    }
    
    const duplicateUser = await userModel.findOne({ username: newUser.username });
    if (duplicateUser) {
      return res.status(409).json({ message: 'User already exists!' });
    }
    
    const valid = createUserValidation.safeParse(newUser);
    if (!valid.success) {
      return res.status(400).json({
        status: "fail",
        message: z.treeifyError(valid.error)
      });
    }
    
    // data base transaction (both sucess or both fail)
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const hashedPassword = await hashePassword(newUser.password, 10);
      const user = await userModel.create([{
        ...valid.data,
        password: hashedPassword
      }], { session });
      
      if (user[0]!.role === 2100) {
        await cartModel.create([{
          user_id: user[0]!._id,
          items: []
        }], { session });
      }
      
      await session.commitTransaction();
      
      res.status(201).json({
        status: `ok ${res.statusCode}`,
        data: user[0]
      });
      
    } catch (error: any) {
      await session.abortTransaction();
      res.status(500).json({
        status: `fail ${res.statusCode}`,
        message: error.message
      });
    } finally {
      await session.endSession();
    }
    
  } catch (error: any) {
    res.status(500).json({
      status: `fail ${res.statusCode}`,
      message: error.message
    });
  }
};