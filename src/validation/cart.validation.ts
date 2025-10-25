import {z} from 'zod';
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const cartValidation = z.object({
    user_id:objectIdSchema,
    items:z.array(z.string()),
    updated_at:z.iso.date()
});

export default cartValidation;