import {z} from 'zod';
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");


export const paymentValidation = z.object({
    user_id:objectIdSchema,
    order_id:objectIdSchema,
    method_id:objectIdSchema,
    amount:z.number().positive(),
    status:z.string()
});