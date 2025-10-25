import dotenv from 'dotenv';
import app from "./app";
import { connectDB } from './config/dbConnection';
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () =>{
    try{
        await connectDB();
        app.listen(PORT,()=> console.log(`Server running on http://localhost:${PORT}/`))
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Failed to connect to DB", err);
        process.exit(1);
    }
};

startServer();
