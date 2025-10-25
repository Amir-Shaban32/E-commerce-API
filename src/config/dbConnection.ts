import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI


export const connectDB = async ()=>{
    try{
        if (!MONGO_URI) throw new Error("MONGO_URI not defined in .env file");
        await mongoose.connect(MONGO_URI);
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(err);
    };
}
