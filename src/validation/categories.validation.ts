import {z} from 'zod';
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId").optional();

export const categoryValidation = z.object({
    name:z.string(),
    parent_category_id:objectIdSchema
});
