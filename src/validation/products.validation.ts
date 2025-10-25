import {z} from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createProductsValidation = z.object({
    name:z.string().min(2,"Invalid name!"),
    description:z.string().min(2,"write descriptive description"),
    category_id:objectIdSchema,
    price:z.number().positive(),
    currency:z.string().length(3,"Invalid currency!"),
    brand:z.string().min(2,"Invalid brand!").optional(),
    images:z.array(z.string().refine((img)=>{
        try{
            new URL(img);
            return true;
        }catch (error: unknown) {
            return false;
        }
    },{message:"Invalid image!"})).optional(),
    stock_quantity:z.number().int().positive(),
    ratings:z.number().positive()
});

export const updateProductValidation = z.object({
    name:z.string().min(2,"Invalid name!").optional(),
    description:z.string().min(2,"write descriptive description").optional(),
    category_id:objectIdSchema.optional(),
    price:z.number().positive().optional(),
    currency:z.string().length(3,"Invalid currency!").optional(),
    brand:z.string().min(2,"Invalid brand!").optional().optional(),
    images:z.array(z.string().refine((img)=>{
        try{
            new URL(img);
            return true;
        }catch (error: unknown) {
            return false;
        }
    },{message:"Invalid image!"})).optional(),
    stock_quantity:z.number().int().positive().optional(),
    ratings:z.number().positive().optional()    
}).strict();
